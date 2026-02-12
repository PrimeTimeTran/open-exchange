import { PrismaClient, Prisma } from '@prisma/client';

export async function ensureAccount(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
  assetSymbol: string,
) {
  const accountName = assetSymbol === 'USD' ? 'USD' : `${assetSymbol}_USD`;
  const accountType = assetSymbol === 'USD' ? 'cash' : 'custody';

  let account = await prisma.account.findFirst({
    where: {
      tenantId,
      userId: membershipId,
      name: accountName,
    },
  });

  if (!account) {
    // console.log(`Creating ${accountName} account for user...`);
    account = await prisma.account.create({
      data: {
        name: accountName,
        tenantId,
        userId: membershipId,
        type: accountType,
        status: 'active',
        createdByMembershipId: membershipId,
        updatedByMembershipId: membershipId,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
    });
  }
  return account;
}

export async function ensureWallet(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
  accountId: string,
  assetId: string,
  amount: number | bigint | Prisma.Decimal,
  options: { increment?: boolean } = {},
) {
  const decimalAmount = new Prisma.Decimal(amount.toString());

  let wallet = await prisma.wallet.findFirst({
    where: { tenantId, accountId, assetId },
  });

  if (wallet) {
    if (options.increment) {
      wallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          available: { increment: decimalAmount },
          total: { increment: decimalAmount },
        },
      });
    } else {
      // console.log(`Wallet already exists.`);
    }
  } else {
    wallet = await prisma.wallet.create({
      data: {
        tenantId,
        locked: 0,
        version: 1,
        userId: membershipId,
        accountId: accountId,
        assetId: assetId,
        available: decimalAmount,
        total: decimalAmount,
        createdByMembershipId: membershipId,
        updatedByMembershipId: membershipId,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
    });
  }
  return wallet;
}

export async function createDeposit(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
  accountId: string,
  assetId: string,
  amount: number | bigint | Prisma.Decimal,
  txHash: string,
  status: string = 'completed',
) {
  const decimalAmount = new Prisma.Decimal(amount.toString());

  // 1. Create Deposit Record
  const deposit = await prisma.deposit.create({
    data: {
      tenantId,
      accountId,
      assetId,
      amount: decimalAmount.toString(),
      status,
      txHash,
      chain: 'internal',
      createdByMembershipId: membershipId,
      updatedByMembershipId: membershipId,
      createdByUserId: userId,
      updatedByUserId: userId,
    },
  });

  // 2. Create Ledger Event
  const ledgerEvent = await prisma.ledgerEvent.create({
    data: {
      tenantId,
      type: 'deposit',
      referenceId: deposit.id,
      referenceType: 'Deposit',
      status: 'completed',
      description: `Deposit of ${decimalAmount.toString()} via seed script`,
      createdByMembershipId: membershipId,
      updatedByMembershipId: membershipId,
      createdByUserId: userId,
      updatedByUserId: userId,
    },
  });

  // 3. Create Ledger Entry
  await prisma.ledgerEntry.create({
    data: {
      tenantId,
      eventId: ledgerEvent.id,
      accountId: accountId,
      amount: decimalAmount,
      // No explicit assetId on LedgerEntry? Wait, typically ledger is double-entry or linked to asset.
      // The schema for LedgerEntry shows: amount, accountId, eventId, meta.
      // It does NOT have assetId. It relies on accountId (which is linked to asset context usually? or maybe account is multi-asset?)
      // In our schema, Account is "USD" or "BTC_USD".
      // Wallet is linked to Account + Asset.
      // So Account + LedgerEntry implies asset?
      // Wait, Account model:
      // name, type, status.
      // It doesn't strictly enforce one asset.
      // But we name them "USD", "BTC_USD".
      // Let's assume the Account context is sufficient.
      createdByMembershipId: membershipId,
      updatedByMembershipId: membershipId,
      createdByUserId: userId,
      updatedByUserId: userId,
    },
  });

  return deposit;
}

export async function createWithdrawal(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
  accountId: string,
  assetId: string,
  amount: number | bigint | Prisma.Decimal,
  txHash: string,
  status: string = 'completed',
) {
  const decimalAmount = new Prisma.Decimal(amount.toString());

  // 1. Create Withdrawal Record
  const withdrawal = await prisma.withdrawal.create({
    data: {
      tenantId,
      accountId,
      assetId,
      amount: decimalAmount.toString(),
      status,
      txHash,
      chain: 'internal',
      createdByMembershipId: membershipId,
      updatedByMembershipId: membershipId,
      createdByUserId: userId,
      updatedByUserId: userId,
    },
  });

  // 2. Create Ledger Event
  const ledgerEvent = await prisma.ledgerEvent.create({
    data: {
      tenantId,
      type: 'withdrawal',
      referenceId: withdrawal.id,
      referenceType: 'Withdrawal',
      status: 'completed',
      description: `Withdrawal of ${decimalAmount.toString()} via seed script`,
      createdByMembershipId: membershipId,
      updatedByMembershipId: membershipId,
      createdByUserId: userId,
      updatedByUserId: userId,
    },
  });

  // 3. Create Ledger Entry
  // Note: Withdrawals reduce balance. Ledger entries might be negative or positive depending on accounting.
  // Assuming positive here for "amount involved", but usually debit/credit.
  // Since we don't have debit/credit columns, assuming amount is absolute.
  await prisma.ledgerEntry.create({
    data: {
      tenantId,
      eventId: ledgerEvent.id,
      accountId: accountId,
      amount: decimalAmount.negated(), // Withdrawal is negative entry? Or separate type?
      // Checking LedgerEntry schema again: amount Decimal?
      // Typically withdrawals reduce balance.
      // Let's assume negative for now as per double-entry intuition for user account.
      createdByMembershipId: membershipId,
      updatedByMembershipId: membershipId,
      createdByUserId: userId,
      updatedByUserId: userId,
    },
  });

  return withdrawal;
}
