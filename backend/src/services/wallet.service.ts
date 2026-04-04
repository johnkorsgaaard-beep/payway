import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';
import {
  InsufficientFundsError,
  WalletFrozenError,
  TransactionLimitError,
  NotFoundError,
  AppError,
} from '../utils/errors.js';
import { notificationService } from './notification.service.js';
import { stripeService } from './stripe.service.js';
import type { TransactionType, TransactionStatus } from '@prisma/client';

export class WalletService {
  async getWallet(userId: string) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundError('Wallet');
    return wallet;
  }

  async topUp(userId: string, amount: number, stripeChargeId: string) {
    this.validateAmount(amount, env.MIN_TOPUP_AMOUNT, env.MAX_TOPUP_AMOUNT);

    const wallet = await this.getActiveWallet(userId);

    const fee = Math.round(amount * (env.DEFAULT_TOPUP_FEE_PERCENT / 100));
    const netAmount = amount - fee;

    if (wallet.balance + netAmount > env.MAX_WALLET_BALANCE) {
      throw new TransactionLimitError('Maximum wallet balance would be exceeded');
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: netAmount } },
      });

      const transaction = await tx.transaction.create({
        data: {
          toWalletId: wallet.id,
          amount,
          fee,
          type: 'TOPUP',
          status: 'COMPLETED',
          stripeChargeId,
          description: `Wallet top-up: ${(amount / 100).toFixed(2)} DKK`,
        },
      });

      if (fee > 0) {
        await tx.transaction.create({
          data: {
            fromWalletId: wallet.id,
            amount: fee,
            type: 'FEE',
            status: 'COMPLETED',
            description: `Top-up fee: ${(fee / 100).toFixed(2)} DKK`,
          },
        });
      }

      return { wallet: updatedWallet, transaction };
    });

    return result;
  }

  async p2pTransfer(
    senderUserId: string,
    recipientPhone: string,
    amount: number,
    description?: string
  ) {
    this.validateAmount(amount, 100, env.DAILY_TRANSACTION_LIMIT);

    const senderWallet = await this.getActiveWallet(senderUserId);

    const recipient = await prisma.user.findUnique({
      where: { phone: recipientPhone },
      include: { wallet: true },
    });

    if (!recipient || !recipient.wallet) {
      throw new NotFoundError('Recipient');
    }

    if (recipient.id === senderUserId) {
      throw new AppError(400, 'Cannot send money to yourself');
    }

    await this.checkDailyLimit(senderUserId, amount);
    await this.checkMonthlyLimit(senderUserId, amount);

    const fee = await this.calculateP2pFee(senderUserId, amount);

    if (senderWallet.balance < amount + fee) {
      throw new InsufficientFundsError();
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedSenderWallet = await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amount + fee } },
      });

      await tx.wallet.update({
        where: { id: recipient.wallet!.id },
        data: { balance: { increment: amount } },
      });

      const transaction = await tx.transaction.create({
        data: {
          fromWalletId: senderWallet.id,
          toWalletId: recipient.wallet!.id,
          amount,
          fee,
          type: 'P2P',
          status: 'COMPLETED',
          description: description || 'P2P transfer',
        },
      });

      if (fee > 0) {
        await tx.transaction.create({
          data: {
            fromWalletId: senderWallet.id,
            amount: fee,
            type: 'FEE',
            status: 'COMPLETED',
            description: `P2P transfer fee: ${(fee / 100).toFixed(2)} DKK`,
          },
        });
      }

      return { wallet: updatedSenderWallet, transaction };
    });

    const sender = await prisma.user.findUnique({
      where: { id: senderUserId },
      select: { name: true },
    });

    await notificationService.sendPaymentReceived(
      recipient.id,
      sender?.name || 'Someone',
      amount
    );

    return result;
  }

  async merchantPayment(
    userId: string,
    qrReference: string,
    amount: number,
    paymentCardId: string
  ) {
    const qrCode = await prisma.qrCode.findUnique({
      where: { reference: qrReference },
      include: { merchant: true },
    });

    if (!qrCode || !qrCode.isActive) {
      throw new NotFoundError('QR code');
    }

    if (!qrCode.merchant.stripeAccountId) {
      throw new AppError(400, 'Merchant has not completed Stripe onboarding');
    }

    const effectiveAmount = qrCode.amount || amount;
    this.validateAmount(effectiveAmount, 100, 100_000_00); // no wallet limit — Stripe handles it

    const applicationFee = Math.round(effectiveAmount * (qrCode.merchant.feeRate / 100));

    const paymentIntent = await stripeService.createDirectCharge(
      userId,
      paymentCardId,
      effectiveAmount,
      qrCode.merchant.stripeAccountId,
      applicationFee,
      `Payment to ${qrCode.merchant.businessName}`
    );

    const wallet = await prisma.wallet.findUnique({ where: { userId } });

    const transaction = await prisma.transaction.create({
      data: {
        fromWalletId: wallet?.id,
        amount: effectiveAmount,
        fee: applicationFee,
        type: 'MERCHANT_PAYMENT',
        status: 'COMPLETED',
        stripeChargeId: paymentIntent.id,
        description: `Payment to ${qrCode.merchant.businessName}`,
        metadata: {
          qrReference,
          merchantId: qrCode.merchant.id,
          paymentMethod: 'card_direct',
          stripeAccountId: qrCode.merchant.stripeAccountId,
        },
      },
    });

    const customer = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const merchantReceives = effectiveAmount - applicationFee;
    await notificationService.sendPaymentReceived(
      qrCode.merchant.userId,
      customer?.name || 'A customer',
      merchantReceives
    );

    return { transaction };
  }

  async getTransactionHistory(
    userId: string,
    page: number,
    limit: number,
    type?: TransactionType
  ) {
    const wallet = await this.getWallet(userId);

    const where: any = {
      OR: [{ fromWalletId: wallet.id }, { toWalletId: wallet.id }],
      type: { not: 'FEE' as TransactionType },
    };

    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          fromWallet: { include: { user: { select: { name: true, phone: true } } } },
          toWallet: { include: { user: { select: { name: true, phone: true } } } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions: transactions.map((tx) => ({
        ...tx,
        direction: tx.toWalletId === wallet.id ? 'incoming' : 'outgoing',
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllTransactions(
    page: number,
    limit: number,
    type?: TransactionType,
    status?: TransactionStatus,
    from?: string,
    to?: string
  ) {
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          fromWallet: { include: { user: { select: { id: true, name: true, phone: true } } } },
          toWallet: { include: { user: { select: { id: true, name: true, phone: true } } } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAnalytics(from?: string, to?: string) {
    const dateFilter: any = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    const where = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const [
      totalUsers,
      totalMerchants,
      transactionStats,
      volumeByType,
      recentTransactions,
      merchantPaymentStats,
      p2pStats,
      profitByMerchant,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.merchant.count({ where: { status: 'ACTIVE' } }),
      prisma.transaction.aggregate({
        where: { ...where, status: 'COMPLETED', type: { not: 'FEE' } },
        _sum: { amount: true, fee: true },
        _count: true,
        _avg: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ['type'],
        where: { ...where, status: 'COMPLETED' },
        _sum: { amount: true, fee: true },
        _count: true,
        _avg: { amount: true },
      }),
      prisma.transaction.findMany({
        where: { status: 'COMPLETED', type: { not: 'FEE' } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          fromWallet: { include: { user: { select: { name: true } } } },
          toWallet: { include: { user: { select: { name: true } } } },
        },
      }),
      prisma.transaction.aggregate({
        where: { ...where, status: 'COMPLETED', type: 'MERCHANT_PAYMENT' },
        _sum: { amount: true, fee: true },
        _count: true,
        _avg: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...where, status: 'COMPLETED', type: 'P2P' },
        _sum: { amount: true },
        _count: true,
        _avg: { amount: true },
      }),
      prisma.$queryRaw`
        SELECT
          m.id,
          m.business_name AS "businessName",
          m.fee_rate AS "feeRate",
          COUNT(t.id)::int AS "transactionCount",
          COALESCE(SUM(t.amount), 0)::int AS "totalVolume",
          COALESCE(SUM(t.fee), 0)::int AS "totalProfit",
          CASE WHEN COUNT(t.id) > 0
            THEN (SUM(t.amount) / COUNT(t.id))::int
            ELSE 0
          END AS "avgTransaction"
        FROM merchants m
        LEFT JOIN qr_codes q ON q.merchant_id = m.id
        LEFT JOIN transactions t ON t.metadata->>'merchantId' = m.id
          AND t.type = 'MERCHANT_PAYMENT'
          AND t.status = 'COMPLETED'
        GROUP BY m.id, m.business_name, m.fee_rate
        ORDER BY "totalProfit" DESC
      ` as any[],
    ]);

    const avgTransactionAmount = transactionStats._avg?.amount
      ? Math.round(transactionStats._avg.amount)
      : 0;

    return {
      totalUsers,
      totalMerchants,
      totalTransactions: transactionStats._count,
      totalVolume: transactionStats._sum.amount || 0,
      totalFees: transactionStats._sum.fee || 0,
      avgTransactionAmount,
      volumeByType,
      recentTransactions,
      merchantPayments: {
        count: merchantPaymentStats._count,
        totalVolume: merchantPaymentStats._sum.amount || 0,
        totalProfit: merchantPaymentStats._sum.fee || 0,
        avgAmount: merchantPaymentStats._avg?.amount
          ? Math.round(merchantPaymentStats._avg.amount)
          : 0,
      },
      p2p: {
        count: p2pStats._count,
        totalVolume: p2pStats._sum.amount || 0,
        avgAmount: p2pStats._avg?.amount
          ? Math.round(p2pStats._avg.amount)
          : 0,
      },
      profitByMerchant,
    };
  }

  private async getActiveWallet(userId: string) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundError('Wallet');
    if (wallet.status === 'FROZEN') throw new WalletFrozenError();
    if (wallet.status === 'CLOSED') throw new AppError(400, 'Wallet is closed');
    return wallet;
  }

  private validateAmount(amount: number, min: number, max: number) {
    if (amount < min) {
      throw new AppError(400, `Minimum amount is ${(min / 100).toFixed(2)} DKK`);
    }
    if (amount > max) {
      throw new AppError(400, `Maximum amount is ${(max / 100).toFixed(2)} DKK`);
    }
  }

  private async checkDailyLimit(userId: string, amount: number) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundError('Wallet');

    const dailyTotal = await prisma.transaction.aggregate({
      where: {
        fromWalletId: wallet.id,
        status: 'COMPLETED',
        type: { in: ['P2P'] },
        createdAt: { gte: todayStart },
      },
      _sum: { amount: true },
    });

    if ((dailyTotal._sum.amount || 0) + amount > env.DAILY_TRANSACTION_LIMIT) {
      throw new TransactionLimitError('Daily transaction limit');
    }
  }

  private async checkMonthlyLimit(userId: string, amount: number) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundError('Wallet');

    const monthlyTotal = await prisma.transaction.aggregate({
      where: {
        fromWalletId: wallet.id,
        status: 'COMPLETED',
        type: { in: ['P2P'] },
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    });

    if ((monthlyTotal._sum.amount || 0) + amount > env.MONTHLY_TRANSACTION_LIMIT) {
      throw new TransactionLimitError('Monthly transaction limit (10.000 DKK)');
    }
  }

  private async calculateP2pFee(userId: string, amount: number): Promise<number> {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return 0;

    const monthlyP2pCount = await prisma.transaction.count({
      where: {
        fromWalletId: wallet.id,
        type: 'P2P',
        status: 'COMPLETED',
        createdAt: { gte: monthStart },
      },
    });

    if (monthlyP2pCount < env.P2P_FREE_MONTHLY_LIMIT) {
      return 0;
    }

    return Math.round(amount * (env.P2P_FEE_PERCENT / 100));
  }
}

export const walletService = new WalletService();
