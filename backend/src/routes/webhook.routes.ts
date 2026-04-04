import { FastifyInstance } from 'fastify';
import { stripe } from '../config/stripe.js';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';

export async function webhookRoutes(app: FastifyInstance) {
  app.post(
    '/stripe',
    { config: { rawBody: true } },
    async (request, reply) => {
      const sig = request.headers['stripe-signature'] as string;

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          (request as any).rawBody || '',
          sig,
          env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err: any) {
        reply.code(400).send({ error: `Webhook error: ${err.message}` });
        return;
      }

      switch (event.type) {
        case 'payment_intent.succeeded': {
          const pi = event.data.object;
          console.log(`Payment succeeded: ${pi.id}`);
          break;
        }

        case 'payment_intent.payment_failed': {
          const pi = event.data.object;
          console.log(`Payment failed: ${pi.id}`);
          await prisma.transaction.updateMany({
            where: { stripeChargeId: pi.id },
            data: { status: 'FAILED' },
          });
          break;
        }

        case 'payout.paid': {
          const payout = event.data.object;
          await prisma.transaction.updateMany({
            where: { stripePayoutId: payout.id },
            data: { status: 'COMPLETED' },
          });
          break;
        }

        case 'payout.failed': {
          const payout = event.data.object;
          const tx = await prisma.transaction.findFirst({
            where: { stripePayoutId: payout.id },
          });
          if (tx) {
            await prisma.$transaction(async (dbTx) => {
              await dbTx.transaction.update({
                where: { id: tx.id },
                data: { status: 'FAILED' },
              });
              if (tx.fromWalletId) {
                await dbTx.wallet.update({
                  where: { id: tx.fromWalletId },
                  data: { balance: { increment: tx.amount } },
                });
              }
            });
          }
          break;
        }

        case 'account.updated': {
          const account = event.data.object;
          if (account.charges_enabled) {
            await prisma.merchant.updateMany({
              where: { stripeAccountId: account.id },
              data: { status: 'ACTIVE' },
            });
          }
          break;
        }
      }

      reply.send({ received: true });
    }
  );
}
