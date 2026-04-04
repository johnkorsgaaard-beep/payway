import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { authRoutes } from './routes/auth.routes.js';
import { walletRoutes } from './routes/wallet.routes.js';
import { cardRoutes } from './routes/card.routes.js';
import { merchantRoutes } from './routes/merchant.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { webhookRoutes } from './routes/webhook.routes.js';
import { AppError } from './utils/errors.js';
import { ZodError } from 'zod';

const app = Fastify({
  logger: {
    transport:
      env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
});

// Plugins
await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
await app.register(jwt, { secret: env.JWT_SECRET });
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

// Global error handler
app.setErrorHandler((error, _request, reply) => {
  if (error instanceof AppError) {
    reply.code(error.statusCode).send({
      error: error.code || 'ERROR',
      message: error.message,
    });
    return;
  }

  if (error instanceof ZodError) {
    reply.code(400).send({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: error.errors,
    });
    return;
  }

  app.log.error(error);
  reply.code(500).send({
    error: 'INTERNAL_ERROR',
    message: env.NODE_ENV === 'development' ? error.message : 'Internal server error',
  });
});

// Health check
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(walletRoutes, { prefix: '/api/wallet' });
await app.register(cardRoutes, { prefix: '/api/cards' });
await app.register(merchantRoutes, { prefix: '/api/merchant' });
await app.register(adminRoutes, { prefix: '/api/admin' });
await app.register(webhookRoutes, { prefix: '/api/webhooks' });
// Start server
async function start() {
  try {
    await connectDatabase();
    app.log.info('Database connected');

    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`Payway API running on http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    await disconnectDatabase();
    process.exit(1);
  }
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'] as const;
for (const signal of signals) {
  process.on(signal, async () => {
    app.log.info(`Received ${signal}, shutting down...`);
    await app.close();
    await disconnectDatabase();
    process.exit(0);
  });
}

start();
