import 'tsconfig-paths/register';
import { execSync } from 'child_process';
import { join } from 'path';
import { prismaCreateAppUser } from 'src/prisma/prismaCreateAppUser';
import { prismaCreateTriggers } from 'src/prisma/prismaCreateTriggers';

export default async function testGlobalSetup() {
  if (process.env.NODE_ENV !== 'test' && process.env.TEST !== 'true') {
    throw new Error(
      'You are trying to use the test database in a non-test environment',
    );
  }

  const prismaBinary = join(
    __dirname,
    '..',
    '..',
    '..',
    'node_modules',
    '.bin',
    'prisma',
  );

  execSync(`${prismaBinary} migrate reset --force`, {
    env: process.env,
  });

  execSync(`${prismaBinary} db push`, {
    env: process.env,
  });

  await prismaCreateTriggers();
  await prismaCreateAppUser();
}
