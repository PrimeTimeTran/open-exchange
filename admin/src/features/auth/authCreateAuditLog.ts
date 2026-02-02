import { UserWithMemberships } from 'src/features/user/userSchemas';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export async function authCreateAuditLog(
  user: UserWithMemberships,
  operation: string,
  context: AppContext,
) {
  const prisma = prismaDangerouslyBypassAuth(context);
  if (user.memberships?.length) {
    await prisma.auditLog.createMany({
      data: user.memberships.map((membership) => ({
        membershipId: membership.id,
        entityId: membership.userId,
        entityName: 'Membership',
        tenantId: membership.tenantId,
        userId: membership.userId,
        apiKeyId: context?.apiKey?.id,
        operation,
        timestamp: new Date(),
      })),
    });
  } else {
    await prisma.auditLog.create({
      data: {
        entityId: user.id,
        tenantId: null,
        apiKeyId: context?.apiKey?.id,
        userId: user.id,
        entityName: 'User',
        operation,
        timestamp: new Date(),
      },
    });
  }
}
