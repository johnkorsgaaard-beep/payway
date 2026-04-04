import { FastifyInstance } from 'fastify';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { authService } from '../services/auth.service.js';
import { walletService } from '../services/wallet.service.js';
import { merchantService } from '../services/merchant.service.js';
import { paginationSchema, updateFeeSchema } from '../types/index.js';
import { prisma } from '../config/database.js';
import type { TransactionType, TransactionStatus, UserRole } from '@prisma/client';

export async function adminRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireAdmin);

  // Users
  app.get('/users', async (request, reply) => {
    const query = paginationSchema.parse(request.query);
    const { role } = request.query as { role?: UserRole };
    const result = await authService.getAllUsers(query.page, query.limit, role);
    reply.send(result);
  });

  app.put('/users/:userId/status', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { isActive } = request.body as { isActive: boolean };
    const user = await authService.toggleUserActive(userId, isActive);
    reply.send(user);
  });

  // Transactions
  app.get('/transactions', async (request, reply) => {
    const query = paginationSchema.parse(request.query);
    const { type, status, from, to } = request.query as {
      type?: TransactionType;
      status?: TransactionStatus;
      from?: string;
      to?: string;
    };
    const result = await walletService.getAllTransactions(
      query.page,
      query.limit,
      type,
      status,
      from,
      to
    );
    reply.send(result);
  });

  // Merchants
  app.get('/merchants', async (request, reply) => {
    const query = paginationSchema.parse(request.query);
    const result = await merchantService.getAllMerchants(query.page, query.limit);
    reply.send(result);
  });

  app.put('/merchants/:merchantId/status', async (request, reply) => {
    const { merchantId } = request.params as { merchantId: string };
    const { status } = request.body as { status: 'ACTIVE' | 'SUSPENDED' };
    const merchant = await merchantService.updateMerchantStatus(merchantId, status);
    reply.send(merchant);
  });

  app.put('/merchants/:merchantId/fee', async (request, reply) => {
    const { merchantId } = request.params as { merchantId: string };
    const body = updateFeeSchema.parse(request.body);
    const merchant = await merchantService.updateFeeRate(merchantId, body.percentage);
    reply.send(merchant);
  });

  // Analytics
  app.get('/analytics', async (request, reply) => {
    const { from, to } = request.query as { from?: string; to?: string };
    const analytics = await walletService.getAnalytics(from, to);
    reply.send(analytics);
  });

  // Fee configuration
  app.get('/fees', async (_request, reply) => {
    const fees = await prisma.feeConfig.findMany({ orderBy: { name: 'asc' } });
    reply.send(fees);
  });

  app.put('/fees/:feeId', async (request, reply) => {
    const { feeId } = request.params as { feeId: string };
    const body = updateFeeSchema.parse(request.body);
    const fee = await prisma.feeConfig.update({
      where: { id: feeId },
      data: { percentage: body.percentage, fixedAmount: body.fixedAmount },
    });
    reply.send(fee);
  });

  // Audit logs
  app.get('/audit-logs', async (request, reply) => {
    const query = paginationSchema.parse(request.query);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count(),
    ]);
    reply.send({ logs, total, page: query.page, limit: query.limit });
  });
}
