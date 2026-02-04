import 'dotenv/config';
import 'tsconfig-paths/register';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Truncating all tables...');

  // 1. Get all table names from the public schema
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  // 2. Filter out _prisma_migrations so we don't wipe migration history
  const tablesToTruncate = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations');

  if (tablesToTruncate.length === 0) {
    console.log('No tables to truncate.');
    return;
  }

  try {
    // 3. Construct a single TRUNCATE statement for all tables with CASCADE
    //    TRUNCATE TABLE "TableA", "TableB" CASCADE;
    const targets = tablesToTruncate.map((t) => `"${t}"`).join(', ');
    const query = `TRUNCATE TABLE ${targets} CASCADE;`;

    console.log(`Executing: ${query}`);
    await prisma.$executeRawUnsafe(query);
    console.log('Successfully truncated all tables.');
  } catch (error) {
    console.error('Error truncating tables:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
