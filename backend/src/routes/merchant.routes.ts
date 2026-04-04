import { FastifyInstance } from 'fastify';
import { merchantService } from '../services/merchant.service.js';
import { authenticate, requireMerchant } from '../middleware/auth.js';
import { createMerchantSchema, createQrSchema } from '../types/index.js';
import type { JwtPayload } from '../types/index.js';

export async function merchantRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.post('/register', async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const body = createMerchantSchema.parse(request.body);
    const merchant = await merchantService.createMerchant(
      userId,
      body.businessName,
      body.description,
      body.email
    );
    reply.code(201).send(merchant);
  });

  app.get('/me', { preHandler: [requireMerchant] }, async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const merchant = await merchantService.getMerchantByUserId(userId);
    reply.send(merchant);
  });

  app.get('/onboarding-link', { preHandler: [requireMerchant] }, async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const link = await merchantService.getOnboardingLink(userId);
    reply.send({ url: link.url });
  });

  app.post('/qr', { preHandler: [requireMerchant] }, async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const body = createQrSchema.parse(request.body);
    const merchant = await merchantService.getMerchantByUserId(userId);
    const qr = await merchantService.createQrCode(merchant.id, body.amount, body.label);
    reply.code(201).send(qr);
  });

  app.get('/qr', { preHandler: [requireMerchant] }, async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const merchant = await merchantService.getMerchantByUserId(userId);
    reply.send(merchant.qrCodes);
  });

  app.get('/qr/:reference', async (request, reply) => {
    const { reference } = request.params as { reference: string };
    const qr = await merchantService.getQrCode(reference);
    reply.send({
      reference: qr.reference,
      merchantName: qr.merchant.businessName,
      amount: qr.amount,
      label: qr.label,
    });
  });

  app.post('/payout', { preHandler: [requireMerchant] }, async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const { amount } = request.body as { amount: number };
    const payout = await merchantService.requestPayout(userId, amount);
    reply.send({ payoutId: payout.id, status: payout.status });
  });
}
