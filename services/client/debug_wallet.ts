import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const accountId = '79aa5bd1-6cc0-4d6f-808e-120da249a51a';
  const usdtId = 'bc1abb3b-73a2-4c56-9dc0-8c13bfad1e9a';
  const potentialUsdId = '6f00e5d6-fad5-49cb-a2da-3f4279a0dc90';

  console.log(`Checking Account: ${accountId}`);

  const wallets = await prisma.wallet.findMany({
    where: { accountId },
  });

  console.log('--- Wallets ---');
  wallets.forEach((w) => {
    console.log(
      `Asset: ${w.assetId} | Avail: ${w.available} | Locked: ${w.locked} | Total: ${w.total}`,
    );
    if (w.assetId === usdtId) {
      console.log('>>> TARGET ASSET (USDT) <<<');
    }
    if (w.assetId === potentialUsdId) {
      console.log('>>> POTENTIAL USD <<<');
    }
  });

  // Check Asset info
  const usdt = await prisma.asset.findUnique({ where: { id: usdtId } });
  const usd = await prisma.asset.findUnique({ where: { id: potentialUsdId } });

  console.log('--- Asset Info: USDT ---');
  console.log(usdt);
  console.log('--- Asset Info: Potential USD ---');
  console.log(usd);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
