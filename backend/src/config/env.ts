import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),

  STRIPE_SECRET_KEY: z.string(),
  STRIPE_PUBLISHABLE_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),

  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string().default(''),
  FIREBASE_PRIVATE_KEY: z.string().default(''),

  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:3001'),

  DEFAULT_TOPUP_FEE_PERCENT: z.coerce.number().default(1.0),
  DEFAULT_MERCHANT_FEE_PERCENT: z.coerce.number().default(1.5),
  P2P_FREE_MONTHLY_LIMIT: z.coerce.number().default(10),
  P2P_FEE_PERCENT: z.coerce.number().default(0.5),

  DAILY_TRANSACTION_LIMIT: z.coerce.number().default(1000000),
  MONTHLY_TRANSACTION_LIMIT: z.coerce.number().default(1000000),
  MAX_WALLET_BALANCE: z.coerce.number().default(5000000),
  MIN_TOPUP_AMOUNT: z.coerce.number().default(5000),
  MAX_TOPUP_AMOUNT: z.coerce.number().default(1000000),
});

export const env = envSchema.parse(process.env);
