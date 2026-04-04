# Payway - Mobil betalingsplatform til Faeroerne

A MobilePay-like mobile payment platform built for the Faroe Islands, powered by Stripe.

## Architecture

```
Payway/
├── backend/          # Node.js + TypeScript + Fastify API
├── admin/            # Next.js admin dashboard
├── mobile/           # React Native (Expo) mobile app
├── docs/             # Regulatory & compliance documentation
└── docker-compose.yml
```

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend API | Node.js, TypeScript, Fastify, Prisma, PostgreSQL, Redis |
| Admin Dashboard | Next.js 16, TypeScript, Tailwind CSS, Recharts |
| Mobile App | React Native (Expo), TypeScript |
| Payments | Stripe Connect |
| Auth | Firebase Auth (SMS OTP) + PIN + Biometrics |
| Push Notifications | Firebase Cloud Messaging |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Stripe account (with DK platform)
- Firebase project (with phone auth enabled)

### 1. Database & Redis (via Docker)

```bash
docker compose up -d postgres redis
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your Stripe, Firebase, and database credentials
npm install
npx prisma db push
npx prisma db seed        # Creates admin user + demo data
npm run dev
```

API runs on `http://localhost:3000`

### 3. Admin Dashboard

```bash
cd admin
npm install
npm run dev
```

Dashboard runs on `http://localhost:3001`

### 4. Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan QR code with Expo Go, or press `i` for iOS simulator / `a` for Android emulator.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register with Firebase token
- `POST /api/auth/login` - Login with Firebase token
- `POST /api/auth/refresh` - Refresh JWT
- `POST /api/auth/pin` - Set PIN
- `POST /api/auth/pin/verify` - Verify PIN
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/fcm-token` - Update push notification token

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/topup` - Top up wallet via card
- `POST /api/wallet/send` - P2P transfer
- `POST /api/wallet/pay` - Merchant payment (QR)
- `GET /api/wallet/transactions` - Transaction history
- `GET /api/wallet/lookup/:phone` - Look up user by phone

### Cards
- `GET /api/cards` - List payment cards
- `POST /api/cards` - Add payment card
- `DELETE /api/cards/:cardId` - Remove card
- `POST /api/cards/setup-intent` - Create Stripe SetupIntent

### Merchant
- `POST /api/merchant/register` - Register as merchant
- `GET /api/merchant/me` - Get merchant profile
- `POST /api/merchant/qr` - Create QR code
- `GET /api/merchant/qr/:reference` - Get QR code details
- `POST /api/merchant/payout` - Request bank payout

### Admin
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/status` - Activate/deactivate user
- `GET /api/admin/transactions` - All transactions (with filters)
- `GET /api/admin/merchants` - List merchants
- `PUT /api/admin/merchants/:id/status` - Update merchant status
- `PUT /api/admin/merchants/:id/fee` - Update merchant fee rate
- `GET /api/admin/analytics` - Platform analytics
- `GET /api/admin/fees` - Fee configuration
- `PUT /api/admin/fees/:id` - Update fee

## Wallet Model

All amounts are stored in **oere** (cents). 10000 = 100.00 DKK.

1. User tops up wallet via card charge (Stripe fee applies)
2. P2P transfers are internal ledger operations (no Stripe fee)
3. Merchant payments are internal ledger operations (no Stripe fee)
4. Merchant payouts to bank go through Stripe Connect

## Demo Accounts (after seeding)

| User | Phone | PIN | Role |
|------|-------|-----|------|
| Admin | +298000001 | 1234 | ADMIN |
| Demo User | +298123456 | 0000 | USER |
| Cafe Nolsoy | +298654321 | 0000 | MERCHANT |

## Deploy

### Backend + Admin: Docker

```bash
docker compose up -d
```

### Mobile: EAS Build

```bash
cd mobile
npx eas build --platform ios
npx eas build --platform android
npx eas submit --platform ios
npx eas submit --platform android
```

## License

Proprietary - All rights reserved.
