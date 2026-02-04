// @ts-nocheck

import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { Logger } from 'src/shared/lib/Logger';
import 'tsconfig-paths/register';

export default async function testCleanupDatabase() {
  if (process.env.NODE_ENV !== 'test' && process.env.TEST !== 'true') {
    throw new Error(
      'You are trying to use the test database in a non-test environment',
    );
  }

  const prisma = prismaDangerouslyBypassAuth();

  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    Logger.error({ error });
  }
  await prisma.$disconnect();
}
