import { FastifyInstance } from 'fastify';
import { authService } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.js';
import { registerSchema, loginSchema, setPinSchema, verifyPinSchema } from '../types/index.js';
import type { JwtPayload } from '../types/index.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const user = await authService.register(body.firebaseToken, body.phone, body.name);

    const token = app.jwt.sign(
      { userId: user.id, role: user.role } satisfies JwtPayload,
      { expiresIn: '7d' }
    );

    const refreshToken = app.jwt.sign(
      { userId: user.id, role: user.role } satisfies JwtPayload,
      { expiresIn: '30d' }
    );

    reply.code(201).send({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        wallet: user.wallet,
      },
      token,
      refreshToken,
    });
  });

  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await authService.login(body.firebaseToken);

    const token = app.jwt.sign(
      { userId: user.id, role: user.role } satisfies JwtPayload,
      { expiresIn: '7d' }
    );

    const refreshToken = app.jwt.sign(
      { userId: user.id, role: user.role } satisfies JwtPayload,
      { expiresIn: '30d' }
    );

    reply.send({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        wallet: user.wallet,
        merchant: user.merchant,
      },
      token,
      refreshToken,
    });
  });

  app.post('/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };
    try {
      const decoded = app.jwt.verify<JwtPayload>(refreshToken);
      const user = await authService.getUserById(decoded.userId);

      const newToken = app.jwt.sign(
        { userId: user.id, role: user.role } satisfies JwtPayload,
        { expiresIn: '7d' }
      );

      reply.send({ token: newToken });
    } catch {
      reply.code(401).send({ error: 'Invalid refresh token' });
    }
  });

  app.post('/pin', { preHandler: [authenticate] }, async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const body = setPinSchema.parse(request.body);
    await authService.setPin(userId, body.pin);
    reply.send({ message: 'PIN set successfully' });
  });

  app.post('/pin/verify', { preHandler: [authenticate] }, async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const body = verifyPinSchema.parse(request.body);
    await authService.verifyPin(userId, body.pin);
    reply.send({ valid: true });
  });

  app.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const user = await authService.getUserById(userId);
    reply.send({
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      kycStatus: user.kycStatus,
      wallet: user.wallet,
      merchant: user.merchant,
      cards: user.paymentCards?.map((c) => ({
        id: c.id,
        brand: c.brand,
        last4: c.last4,
        expMonth: c.expMonth,
        expYear: c.expYear,
        isDefault: c.isDefault,
      })),
      streak: (user as any).streak
        ? { currentDays: (user as any).streak.currentDays, longestDays: (user as any).streak.longestDays }
        : null,
    });
  });

  app.put('/fcm-token', { preHandler: [authenticate] }, async (request, reply) => {
    const { userId } = (request as any).user as JwtPayload;
    const { fcmToken } = request.body as { fcmToken: string };
    await authService.updateFcmToken(userId, fcmToken);
    reply.send({ message: 'FCM token updated' });
  });
}
