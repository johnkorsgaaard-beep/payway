import { z } from 'zod';

// Phone number validation (Faroese +298 or Danish +45)
export const phoneSchema = z.string().regex(
  /^\+?(298|45)\d{6,8}$/,
  'Invalid phone number. Must be Faroese (+298) or Danish (+45)'
);

export const registerSchema = z.object({
  firebaseToken: z.string(),
  phone: phoneSchema,
  name: z.string().min(2).max(100),
});

export const loginSchema = z.object({
  firebaseToken: z.string(),
});

export const setPinSchema = z.object({
  pin: z.string().length(4).regex(/^\d{4}$/, 'PIN must be 4 digits'),
});

export const verifyPinSchema = z.object({
  pin: z.string().length(4),
});

export const topupSchema = z.object({
  amount: z.number().int().positive(),
  paymentCardId: z.string(),
});

export const p2pTransferSchema = z.object({
  recipientPhone: phoneSchema,
  amount: z.number().int().positive(),
  description: z.string().max(200).optional(),
  pin: z.string().length(4),
});

export const merchantPaymentSchema = z.object({
  qrReference: z.string(),
  amount: z.number().int().positive(),
  pin: z.string().length(4),
  paymentCardId: z.string(),
});

export const addCardSchema = z.object({
  paymentMethodId: z.string(),
});

export const createMerchantSchema = z.object({
  businessName: z.string().min(2).max(200),
  description: z.string().max(500).optional(),
  email: z.string().email(),
});

export const createQrSchema = z.object({
  amount: z.number().int().positive().optional(),
  label: z.string().max(100).optional(),
});

export const updateFeeSchema = z.object({
  percentage: z.number().min(0).max(100),
  fixedAmount: z.number().int().min(0).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export interface JwtPayload {
  userId: string;
  role: string;
}

export interface AuthenticatedRequest {
  user: JwtPayload;
}
