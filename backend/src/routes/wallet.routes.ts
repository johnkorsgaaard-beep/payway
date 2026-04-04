import { FastifyInstance } from 'fastify';
import { walletService } from '../services/wallet.service.js';
import { stripeService } from '../services/stripe.service.js';
import { authService } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.js';
import {
  topupSchema,
  p2pTransferSchema,
  merchantPaymentSchema,
  paginationSchema,
} from '../types/index.js';
import type { JwtPayload } from '../types/index.js';
import type { TransactionType } from '@prisma/client';

export async function walletRoutes(app: FastifyInstance) {
  app.get('/stripe-config', async (_request, reply) => {
    reply.send({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      merchantId: 'merchant.fo.payway',
    });
  });

  app.addHook('preHandler', authenticate);

  app.get('/balance', async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const wallet = await walletService.getWallet(userId);
    reply.send({
      balance: wallet.balance,
      balanceFormatted: `${(wallet.balance / 100).toFixed(2)} DKK`,
      currency: wallet.currency,
      status: wallet.status,
    });
  });

  app.post('/topup/intent', async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const body = topupSchema.parse(request.body);

    const user = await (await import('../config/database.js')).prisma.user.findUnique({
      where: { id: userId },
      include: { paymentCards: { where: { isDefault: true }, take: 1 } },
    });

    let stripeCustomerId: string | undefined;
    if (user?.paymentCards?.[0]) {
      stripeCustomerId = user.paymentCards[0].stripeCustomerId;
    }

    const { stripe } = await import('../config/stripe.js');
    const intentParams: any = {
      amount: body.amount,
      currency: 'dkk',
      metadata: { paywayUserId: userId, type: 'wallet_topup' },
    };

    if (stripeCustomerId) {
      intentParams.customer = stripeCustomerId;
    }

    const paymentIntent = await stripe.paymentIntents.create(intentParams);

    reply.send({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  });

  app.post('/topup/confirm', async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const { paymentIntentId, amount } = request.body as {
      paymentIntentId: string;
      amount: number;
    };

    const result = await walletService.topUp(userId, amount, paymentIntentId);

    reply.send({
      wallet: {
        balance: result.wallet.balance,
        balanceFormatted: `${(result.wallet.balance / 100).toFixed(2)} DKK`,
      },
      transaction: result.transaction,
    });
  });

  app.post('/topup', async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const body = topupSchema.parse(request.body);

    const paymentIntent = await stripeService.chargeCard(
      userId,
      body.paymentCardId,
      body.amount
    );

    const result = await walletService.topUp(
      userId,
      body.amount,
      paymentIntent.id
    );

    reply.send({
      wallet: {
        balance: result.wallet.balance,
        balanceFormatted: `${(result.wallet.balance / 100).toFixed(2)} DKK`,
      },
      transaction: result.transaction,
    });
  });

  app.post('/send', async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const body = p2pTransferSchema.parse(request.body);

    await authService.verifyPin(userId, body.pin);

    const result = await walletService.p2pTransfer(
      userId,
      body.recipientPhone,
      body.amount,
      body.description
    );

    reply.send({
      wallet: {
        balance: result.wallet.balance,
        balanceFormatted: `${(result.wallet.balance / 100).toFixed(2)} DKK`,
      },
      transaction: result.transaction,
    });
  });

  app.post('/pay', async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const body = merchantPaymentSchema.parse(request.body);

    await authService.verifyPin(userId, body.pin);

    const result = await walletService.merchantPayment(
      userId,
      body.qrReference,
      body.amount,
      body.paymentCardId
    );

    reply.send({ transaction: result.transaction });
  });

  app.get('/transactions', async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const query = paginationSchema.parse(request.query);
    const { type } = request.query as { type?: TransactionType };

    const result = await walletService.getTransactionHistory(
      userId,
      query.page,
      query.limit,
      type
    );

    reply.send(result);
  });

  app.get('/lookup/:phone', async (request, reply) => {
    const { phone } = request.params as { phone: string };
    const user = await authService.getUserByPhone(phone);
    if (!user) {
      reply.code(404).send({ error: 'User not found' });
      return;
    }
    reply.send({ id: user.id, name: user.name, phone: user.phone });
  });
}
