import { PrismaClient } from '@prisma/client';
import { seedJobs } from './jobs';
import { seedSystemAccounts } from './systemAccounts';

export async function seedPlatformData(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
  assetsMap: Map<string, any>,
) {
  await seedJobs(prisma, tenantId, membershipId, userId);
  await seedSystemAccounts(prisma, tenantId, membershipId, userId, assetsMap);
}
