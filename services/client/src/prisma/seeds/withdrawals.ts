import { PrismaClient } from '@prisma/client';

export async function seedWithdrawals(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
  assetsMap: Map<string, any>,
) {
  console.log('Seeding withdrawals...');

  const withdrawals = [
    { asset: 'BTC', amount: 0.1, status: 'completed', txHash: '0x111aaa' },
    { asset: 'ETH', amount: 2.5, status: 'pending', txHash: '0x222bbb' },
    {
      asset: 'USD',
      amount: 1000.0,
      status: 'completed',
      txHash: 'bank_transfer_withdrawal_001',
    },
  ];

  let account = await prisma.account.findFirst({
    where: {
      tenantId,
      userId: membershipId,
    },
  });

  if (!account) {
    console.log('Account not found for withdrawals, skipping...');
    return;
  }

  for (const withdrawalData of withdrawals) {
    const asset = assetsMap.get(withdrawalData.asset);
    if (!asset) {
      console.log(
        `Asset ${withdrawalData.asset} not found, skipping withdrawal...`,
      );
      continue;
    }

    const amount = BigInt(
      Math.floor(withdrawalData.amount * Math.pow(10, asset.decimals || 0)),
    );

    const existingWithdrawal = await prisma.withdrawal.findFirst({
      where: {
        tenantId,
        accountId: account.id,
        txHash: withdrawalData.txHash,
      },
    });

    if (!existingWithdrawal) {
      console.log(
        `Creating withdrawal for ${withdrawalData.amount} ${withdrawalData.asset} (base: ${amount})...`,
      );
      await prisma.withdrawal.create({
        data: {
          tenantId,
          accountId: account.id,
          assetId: asset.id,
          amount: amount.toString(),
          status: withdrawalData.status,
          txHash: withdrawalData.txHash,
          chain: 'mainnet',
          createdByMembershipId: membershipId,
          updatedByMembershipId: membershipId,
          createdByUserId: userId,
          updatedByUserId: userId,
        },
      });
    } else {
      console.log(`Withdrawal ${withdrawalData.txHash} already exists.`);
    }
  }
}
