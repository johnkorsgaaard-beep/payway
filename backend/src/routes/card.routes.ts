import { FastifyInstance } from 'fastify';
import { stripeService } from '../services/stripe.service.js';
import { authenticate } from '../middleware/auth.js';
import { addCardSchema } from '../types/index.js';
import type { JwtPayload } from '../types/index.js';

export async function cardRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.get('/', async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const cards = await stripeService.getUserCards(userId);
    reply.send(
      cards.map((c) => ({
        id: c.id,
        brand: c.brand,
        last4: c.last4,
        expMonth: c.expMonth,
        expYear: c.expYear,
        isDefault: c.isDefault,
      }))
    );
  });

  app.post('/', async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const body = addCardSchema.parse(request.body);
    const card = await stripeService.addPaymentCard(userId, body.paymentMethodId);
    reply.code(201).send({
      id: card.id,
      brand: card.brand,
      last4: card.last4,
      expMonth: card.expMonth,
      expYear: card.expYear,
      isDefault: card.isDefault,
    });
  });

  app.delete('/:cardId', async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const { cardId } = request.params as { cardId: string };
    await stripeService.removePaymentCard(userId, cardId);
    reply.send({ message: 'Card removed' });
  });

  app.post('/setup-intent', async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const cards = await stripeService.getUserCards(userId);

    let customerId: string;
    if (cards.length > 0) {
      customerId = cards[0].stripeCustomerId;
    } else {
      const { getUserById } = await import('../services/auth.service.js').then(m => m.authService);
      const user = await getUserById(userId);
      const customer = await stripeService.createCustomer(userId, user.phone, user.name || undefined);
      customerId = customer.id;
    }

    const { stripe } = await import('../config/stripe.js');
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    reply.send({
      clientSecret: setupIntent.client_secret,
      customerId,
    });
  });
}
