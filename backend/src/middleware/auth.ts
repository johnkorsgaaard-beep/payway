import { FastifyRequest, FastifyReply } from 'fastify';
import type { JwtPayload } from '../types/index.js';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const decoded = await request.jwtVerify<JwtPayload>();
    (request as any).user = decoded;
  } catch {
    reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const user = (request as any).user as JwtPayload | undefined;
  if (!user || user.role !== 'ADMIN') {
    reply.code(403).send({ error: 'Forbidden', message: 'Admin access required' });
  }
}

export async function requireMerchant(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const user = (request as any).user as JwtPayload | undefined;
  if (!user || (user.role !== 'MERCHANT' && user.role !== 'ADMIN')) {
    reply.code(403).send({ error: 'Forbidden', message: 'Merchant access required' });
  }
}
