import 'dotenv/config';
import 'tsconfig-paths/register';
import { PrismaClient } from '@prisma/client';
import { seedTenant } from './tenant';
import { seedUser } from './user';
import { seedMembership } from './membership';
import { seedAssets } from './assets';
import { seedInstruments } from './instruments';
import { seedWallets } from './wallets';
import { seedDeposits } from './deposits';
import { seedWithdrawals } from './withdrawals';
import { seedOrders } from './orders';
import { seedSystemAccounts } from './systemAccounts';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding development data...');

  const tenant = await seedTenant(prisma);
  const user = await seedUser(prisma);
  const membership = await seedMembership(prisma, user.id, tenant.id);
  const assetsMap = await seedAssets(prisma, tenant.id, membership.id, user.id);
  await seedInstruments(prisma, tenant.id, membership.id, user.id, assetsMap);
  await seedWallets(prisma, tenant.id, membership.id, user.id, assetsMap);
  await seedDeposits(prisma, tenant.id, membership.id, user.id, assetsMap);
  await seedWithdrawals(prisma, tenant.id, membership.id, user.id, assetsMap);
  await seedOrders(prisma, tenant.id, membership.id, user.id);
  await seedSystemAccounts(
    prisma,
    tenant.id,
    membership.id,
    user.id,
    assetsMap,
  );

  console.log('Seeding completed.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
