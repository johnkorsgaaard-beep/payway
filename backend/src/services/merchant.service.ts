import { prisma } from '../config/database.js';
import { stripeService } from './stripe.service.js';
import { AppError, NotFoundError } from '../utils/errors.js';

export class MerchantService {
  async createMerchant(userId: string, businessName: string, description?: string, email?: string) {
    const existing = await prisma.merchant.findUnique({ where: { userId } });
    if (existing) {
      throw new AppError(409, 'User is already registered as a merchant');
    }

    let stripeAccountId: string | undefined;
    if (email) {
      const account = await stripeService.createConnectAccount(userId, email, businessName);
      stripeAccountId = account.id;
    }

    const merchant = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { role: 'MERCHANT' },
      });

      return tx.merchant.create({
        data: {
          userId,
          businessName,
          description,
          stripeAccountId,
        },
      });
    });

    return merchant;
  }

  async getMerchant(merchantId: string) {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      include: {
        user: { select: { name: true, phone: true } },
        qrCodes: true,
      },
    });
    if (!merchant) throw new NotFoundError('Merchant');
    return merchant;
  }

  async getMerchantByUserId(userId: string) {
    const merchant = await prisma.merchant.findUnique({
      where: { userId },
      include: { qrCodes: true },
    });
    if (!merchant) throw new NotFoundError('Merchant');
    return merchant;
  }

  async getAllMerchants(page: number, limit: number) {
    const [merchants, total] = await Promise.all([
      prisma.merchant.findMany({
        include: {
          user: { select: { name: true, phone: true } },
          _count: { select: { qrCodes: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.merchant.count(),
    ]);

    return { merchants, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateMerchantStatus(merchantId: string, status: 'ACTIVE' | 'SUSPENDED') {
    return prisma.merchant.update({
      where: { id: merchantId },
      data: { status },
    });
  }

  async updateFeeRate(merchantId: string, feeRate: number) {
    return prisma.merchant.update({
      where: { id: merchantId },
      data: { feeRate },
    });
  }

  async createQrCode(merchantId: string, amount?: number, label?: string) {
    return prisma.qrCode.create({
      data: { merchantId, amount, label },
    });
  }

  async getQrCode(reference: string) {
    const qr = await prisma.qrCode.findUnique({
      where: { reference },
      include: {
        merchant: {
          include: { user: { select: { name: true } } },
        },
      },
    });
    if (!qr) throw new NotFoundError('QR code');
    return qr;
  }

  async toggleQrCode(qrId: string, merchantId: string, isActive: boolean) {
    return prisma.qrCode.updateMany({
      where: { id: qrId, merchantId },
      data: { isActive },
    });
  }

  async getOnboardingLink(userId: string) {
    const merchant = await this.getMerchantByUserId(userId);
    if (!merchant.stripeAccountId) {
      throw new AppError(400, 'No Stripe account linked');
    }
    return stripeService.createConnectOnboardingLink(merchant.stripeAccountId);
  }

  async requestPayout(userId: string, amount: number) {
    const merchant = await this.getMerchantByUserId(userId);
    if (!merchant.stripeAccountId) {
      throw new AppError(400, 'No Stripe account linked. Complete onboarding first.');
    }

    // Stripe Connect handles merchant balances directly — payouts go from
    // the merchant's Stripe Connect balance to their bank account.
    const payout = await stripeService.createPayoutToBank(merchant.stripeAccountId, amount);

    await prisma.transaction.create({
      data: {
        amount,
        type: 'WITHDRAWAL',
        status: 'PENDING',
        stripePayoutId: payout.id,
        description: `Merchant payout to bank: ${(amount / 100).toFixed(2)} DKK`,
        metadata: { merchantId: merchant.id, stripeAccountId: merchant.stripeAccountId },
      },
    });

    return payout;
  }
}

export const merchantService = new MerchantService();
