import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPinHash = await bcrypt.hash('1234', 10);

  const admin = await prisma.user.upsert({
    where: { phone: '+298000001' },
    update: {},
    create: {
      phone: '+298000001',
      name: 'Payway Admin',
      role: 'ADMIN',
      kycStatus: 'VERIFIED',
      pinHash: adminPinHash,
      wallet: {
        create: { currency: 'DKK' },
      },
    },
  });

  console.log(`Admin user created: ${admin.id}`);

  // Fee configs
  const fees = [
    { name: 'topup_fee', percentage: 1.0, fixedAmount: 0 },
    { name: 'p2p_fee', percentage: 0.5, fixedAmount: 0 },
    { name: 'merchant_fee', percentage: 1.5, fixedAmount: 0 },
    { name: 'withdrawal_fee', percentage: 0.0, fixedAmount: 500 },
  ];

  for (const fee of fees) {
    await prisma.feeConfig.upsert({
      where: { name: fee.name },
      update: { percentage: fee.percentage, fixedAmount: fee.fixedAmount },
      create: fee,
    });
  }

  console.log('Fee configs created');

  // Demo user
  const userPinHash = await bcrypt.hash('0000', 10);

  const demoUser = await prisma.user.upsert({
    where: { phone: '+298123456' },
    update: {},
    create: {
      phone: '+298123456',
      name: 'Demo User',
      kycStatus: 'BASIC',
      pinHash: userPinHash,
      wallet: {
        create: { balance: 50000, currency: 'DKK' },
      },
    },
  });

  console.log(`Demo user created: ${demoUser.id}`);

  // Demo merchant
  const merchantUser = await prisma.user.upsert({
    where: { phone: '+298654321' },
    update: {},
    create: {
      phone: '+298654321',
      name: 'Demo Merchant',
      role: 'MERCHANT',
      kycStatus: 'VERIFIED',
      pinHash: userPinHash,
      wallet: {
        create: { balance: 0, currency: 'DKK' },
      },
    },
  });

  const merchant = await prisma.merchant.upsert({
    where: { userId: merchantUser.id },
    update: {},
    create: {
      userId: merchantUser.id,
      businessName: 'Café Nólsoy',
      description: 'Cozy café in Tórshavn',
      status: 'ACTIVE',
      feeRate: 1.5,
    },
  });

  await prisma.qrCode.upsert({
    where: { reference: 'demo-cafe-qr' },
    update: {},
    create: {
      merchantId: merchant.id,
      reference: 'demo-cafe-qr',
      label: 'Counter Payment',
    },
  });

  console.log(`Demo merchant created: ${merchant.id}`);
  console.log('Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
