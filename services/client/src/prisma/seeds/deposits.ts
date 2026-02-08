import { PrismaClient } from '@prisma/client';

export async function seedDeposits(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
  assetsMap: Map<string, any>,
) {
  console.log('Seeding deposits...');

  const deposits = [
    { asset: 'BTC', amount: 1.5, status: 'completed', txHash: '0x123abc' },
    { asset: 'ETH', amount: 10.0, status: 'completed', txHash: '0x456def' },
    {
      asset: 'USD',
      amount: 5000.0,
      status: 'completed',
      txHash: 'bank_transfer_001',
    },
    {
      asset: 'USD',
      amount: 250.0,
      status: 'pending',
      txHash: 'bank_transfer_002',
    },
  ];

  let account = await prisma.account.findFirst({
    where: {
      tenantId,
      userId: membershipId,
    },
  });

  if (!account) {
    console.log('Account not found for deposits, skipping...');
    return;
  }

  for (const depositData of deposits) {
    const asset = assetsMap.get(depositData.asset);
    if (!asset) {
      console.log(`Asset ${depositData.asset} not found, skipping deposit...`);
      continue;
    }

    const amount = BigInt(
      Math.floor(depositData.amount * Math.pow(10, asset.decimals || 0)),
    );

    const existingDeposit = await prisma.deposit.findFirst({
      where: {
        tenantId,
        accountId: account.id,
        txHash: depositData.txHash,
      },
    });

    if (!existingDeposit) {
      console.log(
        `Creating deposit for ${depositData.amount} ${depositData.asset} (base: ${amount})...`,
      );
      await prisma.deposit.create({
        data: {
          tenantId,
          accountId: account.id,
          assetId: asset.id,
          amount: amount.toString(),
          status: depositData.status,
          txHash: depositData.txHash,
          chain: 'mainnet',
          createdByMembershipId: membershipId,
          updatedByMembershipId: membershipId,
          createdByUserId: userId,
          updatedByUserId: userId,
        },
      });
    } else {
      console.log(`Deposit ${depositData.txHash} already exists.`);
    }
  }
}
