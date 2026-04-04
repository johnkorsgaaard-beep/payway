import bcrypt from 'bcrypt';
import { prisma } from '../config/database.js';
import { firebaseAuth } from '../config/firebase.js';
import { redis } from '../config/redis.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import type { UserRole } from '@prisma/client';

const PIN_SALT_ROUNDS = 10;
const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCKOUT_SECONDS = 900; // 15 minutes

export class AuthService {
  async verifyFirebaseToken(idToken: string) {
    try {
      return await firebaseAuth.verifyIdToken(idToken);
    } catch {
      throw new AppError(401, 'Invalid Firebase token');
    }
  }

  async register(firebaseToken: string, phone: string, name: string) {
    const decoded = await this.verifyFirebaseToken(firebaseToken);

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      throw new AppError(409, 'Phone number already registered');
    }

    const user = await prisma.user.create({
      data: {
        phone,
        name,
        firebaseUid: decoded.uid,
        kycStatus: 'BASIC',
        wallet: {
          create: { currency: 'DKK' },
        },
      },
      include: { wallet: true },
    });

    return user;
  }

  async login(firebaseToken: string) {
    const decoded = await this.verifyFirebaseToken(firebaseToken);

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { wallet: true, merchant: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Account is deactivated');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return user;
  }

  async setPin(userId: string, pin: string) {
    const hash = await bcrypt.hash(pin, PIN_SALT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { pinHash: hash },
    });
  }

  async verifyPin(userId: string, pin: string): Promise<boolean> {
    const lockoutKey = `pin_lockout:${userId}`;
    const attemptsKey = `pin_attempts:${userId}`;

    const lockout = await redis.get(lockoutKey);
    if (lockout) {
      throw new AppError(429, 'Too many PIN attempts. Try again in 15 minutes.');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pinHash: true },
    });

    if (!user?.pinHash) {
      throw new AppError(400, 'PIN not set. Please set a PIN first.');
    }

    const valid = await bcrypt.compare(pin, user.pinHash);

    if (!valid) {
      const attempts = await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, PIN_LOCKOUT_SECONDS);

      if (attempts >= MAX_PIN_ATTEMPTS) {
        await redis.set(lockoutKey, '1', 'EX', PIN_LOCKOUT_SECONDS);
        await redis.del(attemptsKey);
        throw new AppError(429, 'Too many PIN attempts. Account locked for 15 minutes.');
      }

      throw new AppError(401, `Invalid PIN. ${MAX_PIN_ATTEMPTS - attempts} attempts remaining.`);
    }

    await redis.del(attemptsKey);
    return true;
  }

  async updateFcmToken(userId: string, fcmToken: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
    });
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true, merchant: true, paymentCards: true },
    });
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async getUserByPhone(phone: string) {
    const user = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, name: true, phone: true },
    });
    return user;
  }

  async getAllUsers(page: number, limit: number, role?: UserRole) {
    const where = role ? { role } : {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { wallet: true, merchant: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async toggleUserActive(userId: string, isActive: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }
}

export const authService = new AuthService();
