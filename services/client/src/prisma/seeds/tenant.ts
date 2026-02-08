import { PrismaClient } from '@prisma/client';

export async function seedTenant(prisma: PrismaClient) {
  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.log('Creating default tenant...');
    tenant = await prisma.tenant.create({
      data: {
        name: 'Default Tenant',
        createdByUserId: null,
        updatedByUserId: null,
      },
    });
  }
  const tenantId = tenant.id;
  console.log(`Using tenant: ${tenantId}`);
  return tenant;
}
