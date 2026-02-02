import { Prisma, User } from '@prisma/client';
import { MembershipStatus } from 'src/features/membership/MembershipStatus';
import { roles } from 'src/features/roles';
import {
  prismaDangerouslyBypassAuth,
  prismaTransactionDangerouslyBypassAuth,
} from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export async function tenantOnboardSingleTenant(
  user: User,
  oauthExtraData: { firstName?: string; lastName?: string } | null,
  context: AppContext,
) {
  if (process.env.NEXT_PUBLIC_TENANT_MODE !== 'single') {
    throw new Error('NEXT_PUBLIC_TENANT_MODE is not single');
  }

  const tenant = await tenantFindSingleTenant(context);
  const queries: Array<Prisma.PrismaPromise<any>> = [];

  const prismaWT = prismaTransactionDangerouslyBypassAuth(context);

  if (!tenant) {
    const createSingleTenantQuery = prismaWT.tenant.create({
      data: {
        name: 'default',
        memberships: {
          create: {
            userId: user.id,
            roles: [roles.admin],
          },
        },
      },
    });

    queries.push(createSingleTenantQuery);
    return { onboardSingleTenantQueries: queries };
  }

  const prisma = prismaDangerouslyBypassAuth(context);
  const membership = await prisma.membership.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (membership && MembershipStatus.isInvited(membership)) {
    const activateMembershipQuery = prismaWT.membership.update({
      where: { id: membership.id },
      data: {
        invitationToken: null,
        firstName: oauthExtraData?.firstName || undefined,
        lastName: oauthExtraData?.lastName || undefined,
      },
    });

    queries.push(activateMembershipQuery);
    return { onboardSingleTenantQueries: queries };
  }

  if (!membership) {
    const createMembershipQuery = prismaWT.membership.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        firstName: oauthExtraData?.firstName || undefined,
        lastName: oauthExtraData?.lastName || undefined,
        // Add default roles for new members here
        roles: [],
      },
    });
    queries.push(createMembershipQuery);
    return { onboardSingleTenantQueries: queries };
  }

  return { onboardSingleTenantQueries: queries };
}

async function tenantFindSingleTenant(context: AppContext) {
  if (process.env.NEXT_PUBLIC_TENANT_MODE !== 'single') {
    throw new Error('NEXT_PUBLIC_TENANT_MODE is not single');
  }

  const prisma = prismaDangerouslyBypassAuth(context);
  return prisma.tenant.findFirst();
}
