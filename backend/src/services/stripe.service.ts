import { stripe } from '../config/stripe.js';
import { prisma } from '../config/database.js';
import { AppError, NotFoundError } from '../utils/errors.js';

export class StripeService {
  async createCustomer(userId: string, phone: string, name?: string) {
    const customer = await stripe.customers.create({
      phone,
      name: name || undefined,
      metadata: { paywayUserId: userId },
    });
    return customer;
  }

  async addPaymentCard(userId: string, paymentMethodId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { paymentCards: true },
    });

    if (!user) throw new NotFoundError('User');

    let stripeCustomerId: string;

    if (user.paymentCards.length > 0) {
      stripeCustomerId = user.paymentCards[0].stripeCustomerId;
    } else {
      const customer = await this.createCustomer(userId, user.phone, user.name || undefined);
      stripeCustomerId = customer.id;
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (!pm.card) {
      throw new AppError(400, 'Invalid payment method: not a card');
    }

    const isFirst = user.paymentCards.length === 0;

    const card = await prisma.paymentCard.create({
      data: {
        userId,
        stripePaymentMethodId: paymentMethodId,
        stripeCustomerId,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
        isDefault: isFirst,
      },
    });

    return card;
  }

  async removePaymentCard(userId: string, cardId: string) {
    const card = await prisma.paymentCard.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) throw new NotFoundError('Card');

    await stripe.paymentMethods.detach(card.stripePaymentMethodId);
    await prisma.paymentCard.delete({ where: { id: cardId } });
  }

  async chargeCard(userId: string, cardId: string, amount: number) {
    const card = await prisma.paymentCard.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) throw new NotFoundError('Card');

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'dkk',
      customer: card.stripeCustomerId,
      payment_method: card.stripePaymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        paywayUserId: userId,
        type: 'wallet_topup',
      },
    });

    return paymentIntent;
  }

  async createConnectAccount(userId: string, email: string, businessName: string) {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'DK',
      default_currency: 'dkk',
      email,
      business_type: 'company',
      company: { name: businessName },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { paywayUserId: userId },
    });

    return account;
  }

  async createConnectOnboardingLink(accountId: string) {
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.CORS_ORIGIN}/merchant/onboarding/refresh`,
      return_url: `${process.env.CORS_ORIGIN}/merchant/onboarding/complete`,
      type: 'account_onboarding',
    });
    return link;
  }

  async createPayoutToBank(accountId: string, amount: number) {
    const payout = await stripe.payouts.create(
      { amount, currency: 'dkk' },
      { stripeAccount: accountId }
    );
    return payout;
  }

  async getUserCards(userId: string) {
    return prisma.paymentCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDirectCharge(
    userId: string,
    cardId: string,
    amount: number,
    merchantStripeAccountId: string,
    applicationFeeAmount: number,
    description: string
  ) {
    const card = await prisma.paymentCard.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) throw new NotFoundError('Card');

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'dkk',
      customer: card.stripeCustomerId,
      payment_method: card.stripePaymentMethodId,
      off_session: true,
      confirm: true,
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: merchantStripeAccountId,
      },
      metadata: {
        paywayUserId: userId,
        type: 'merchant_payment',
      },
      description,
    });

    return paymentIntent;
  }

  async createPaymentIntent(amount: number) {
    return stripe.paymentIntents.create({
      amount,
      currency: 'dkk',
      metadata: { type: 'wallet_topup' },
    });
  }
}

export const stripeService = new StripeService();
