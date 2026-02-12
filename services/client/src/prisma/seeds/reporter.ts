import { PrismaClient } from '@prisma/client';

export async function reportSeeding(prisma: PrismaClient) {
  console.log('\n--- Seeding Report ---\n');

  const printTable = async (
    modelName: string,
    query: any,
    fields?: string[],
  ) => {
    const data = await query.findMany({ take: 5 });
    console.log(`\n### ${modelName} (First 5) ###`);
    if (data.length === 0) {
      console.log('No records found.');
    } else {
      if (fields) {
        // Filter fields for cleaner output if needed, but console.table handles objects well.
        // For now, dumping the whole object is fine for "everything".
        // console.table(data, fields);
        const filteredData = data.map((item: any) => {
          const newItem: any = {};
          fields.forEach((f) => (newItem[f] = item[f]));
          return newItem;
        });
        console.table(filteredData);
      } else {
        console.table(data);
      }
    }
    const count = await query.count();
    console.log(`Total ${modelName}: ${count}`);
  };

  await printTable('Tenants', prisma.tenant, ['id', 'name', 'slug']);
  await printTable('Users', prisma.user, ['id', 'email']);
  await printTable('Memberships', prisma.membership, ['id', 'userId', 'role']);
  await printTable('Assets', prisma.asset, [
    'id',
    'symbol',
    'klass',
    'decimals',
  ]);
  await printTable('Instruments', prisma.instrument, [
    'id',
    'symbol',
    'type',
    'status',
  ]);
  await printTable('Accounts', prisma.account, [
    'id',
    'name',
    'type',
    'userId',
  ]);
  await printTable('Wallets', prisma.wallet, [
    'id',
    'assetId',
    'available',
    'locked',
    'total',
  ]);
  await printTable('Deposits', prisma.deposit, [
    'id',
    'assetId',
    'amount',
    'status',
    'txHash',
  ]);
  await printTable('Withdrawals', prisma.withdrawal, [
    'id',
    'assetId',
    'amount',
    'status',
    'txHash',
  ]);
  await printTable('Orders', prisma.order, [
    'id',
    'instrumentId',
    'side',
    'type',
    'price',
    'quantity',
    'status',
  ]);
  await printTable('Trades', prisma.trade, [
    'id',
    'instrumentId',
    'price',
    'quantity',
    'side',
  ]);
  await printTable('LedgerEvents', prisma.ledgerEvent, [
    'id',
    'type',
    'status',
    'referenceType',
  ]);
  await printTable('LedgerEntries', prisma.ledgerEntry, [
    'id',
    'eventId',
    'accountId',
    'amount',
  ]);

  console.log('\n--- End of Report ---\n');
}
