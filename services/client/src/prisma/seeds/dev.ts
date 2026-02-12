import 'dotenv/config';
import 'tsconfig-paths/register';
import { PrismaClient } from '@prisma/client';
import { seedTenant } from './tenant';
import { seedUser } from './user';
import { seedMembership } from './membership';
import { seedAssets } from './assets';
import { seedPlatformData } from './platformData';
import { seedPlatformUsers, seedUserWithData } from './platformUsers';
import { reportSeeding } from './reporter';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding development data...');
  const tenant = await seedTenant(prisma);
  const user = await seedUser(prisma);
  const membership = await seedMembership(prisma, user.id, tenant.id);
  const assetsMap = await seedAssets(prisma, tenant.id, membership.id, user.id);
  const instruments = await prisma.instrument.findMany({
    include: { underlyingAsset: true, quoteAsset: true },
  });

  const btc = instruments.find((i) => i.symbol === 'BTC_USD');
  const eth = instruments.find((i) => i.symbol === 'ETH_USD');
  const aapl = instruments.find((i) => i.symbol === 'AAPL_USD');
  const tsla = instruments.find((i) => i.symbol === 'TSLA_USD');

  if (btc && eth && aapl && tsla) {
    await seedUserWithData(
      prisma,
      'primetimetran@gmail.com',
      {
        deposits: [
          {
            assetSymbol: 'USD',
            amount: 10_000_000.0,
            txHash: 'bank_transfer_001',
          },
          {
            assetSymbol: 'USD',
            amount: 5_000_000.0,
            txHash: 'bank_transfer_002',
          },
          {
            assetSymbol: 'USD',
            amount: 1_000_000.0,
            txHash: 'bank_transfer_003',
          },
          { assetSymbol: 'BTC', amount: 100, txHash: '0x123abc' },
          { assetSymbol: 'ETH', amount: 1000, txHash: '0x456def' },
        ],
        withdrawals: [
          { assetSymbol: 'BTC', amount: 0.1, txHash: '0x111aaa' },
          { assetSymbol: 'ETH', amount: 2.5, txHash: '0x222bbb' },
          {
            assetSymbol: 'USD',
            amount: 100_000.0,
            txHash: 'large_seed_withdrawal_usd',
          },
          {
            assetSymbol: 'USD',
            amount: 10_000.0,
            txHash: 'bank_transfer_withdrawal_001',
          },
        ],
        openOrders: [
          {
            instrumentId: btc.id,
            status: 'open',
            side: 'buy',
            price: 20_000,
            quantity: 5,
            type: 'limit',
          },
          {
            instrumentId: btc.id,
            status: 'open',
            side: 'buy',
            price: 15_000,
            quantity: 10,
            type: 'limit',
          },
          {
            instrumentId: btc.id,
            status: 'open',
            side: 'buy',
            price: 10_000,
            quantity: 20,
            type: 'limit',
          },
          {
            instrumentId: eth.id,
            status: 'open',
            side: 'buy',
            price: 2_000, // Fixed: Price closer to market value
            quantity: 10, // Fixed: Quantity reasonable for ETH
            type: 'limit',
          },
          {
            instrumentId: aapl.id,
            status: 'open',
            side: 'buy',
            price: 175,
            quantity: 500,
            type: 'limit',
          },
          {
            instrumentId: tsla.id,
            status: 'open',
            side: 'buy',
            price: 150,
            quantity: 500,
            type: 'limit',
          },
        ],
      },
      tenant.id,
      assetsMap,
      instruments,
    );
  }

  await seedPlatformUsers(prisma, tenant.id, assetsMap);
  await seedPlatformData(prisma, tenant.id, membership.id, user.id, assetsMap);

  console.log('Seeding completed.');
  await reportSeeding(prisma);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
