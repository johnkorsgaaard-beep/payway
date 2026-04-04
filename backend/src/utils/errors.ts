export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string) {
    super(404, `${entity} not found`, 'NOT_FOUND');
  }
}

export class InsufficientFundsError extends AppError {
  constructor() {
    super(400, 'Insufficient funds in wallet', 'INSUFFICIENT_FUNDS');
  }
}

export class InvalidPinError extends AppError {
  constructor() {
    super(401, 'Invalid PIN code', 'INVALID_PIN');
  }
}

export class TransactionLimitError extends AppError {
  constructor(limit: string) {
    super(400, `Transaction limit exceeded: ${limit}`, 'LIMIT_EXCEEDED');
  }
}

export class WalletFrozenError extends AppError {
  constructor() {
    super(403, 'Wallet is frozen', 'WALLET_FROZEN');
  }
}

export function formatOereToKr(oere: number): string {
  return (oere / 100).toFixed(2);
}

export function formatKrToOere(kr: number): number {
  return Math.round(kr * 100);
}
