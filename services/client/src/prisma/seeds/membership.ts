import { PrismaClient } from '@prisma/client';

export async function seedMembership(
  prisma: PrismaClient,
  userId: string,
  tenantId: string,
) {
  let membership = await prisma.membership.findFirst({
    where: {
      userId: userId,
      tenantId: tenantId,
    },
  });

  if (!membership) {
    console.log('Creating membership...');
    membership = await prisma.membership.create({
      data: {
        userId: userId,
        tenantId: tenantId,
        roles: ['admin'],
        status: 'active',
        firstName: 'Loi',
        lastName: 'Tran',
        fullName: 'Loi Tran',
        createdByUserId: userId,
        updatedByUserId: userId,
        createdByMembershipId: null,
        updatedByMembershipId: null,
      },
    });
  }
  return membership;
}
