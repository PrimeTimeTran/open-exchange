import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { referralRestoreManyInputSchema } from 'src/features/referral/referralSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const referralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/referral/restore',
  request: {
    query: referralRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function referralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.referralRestore,
    context,
  );

  const { ids } = referralRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.referral.updateMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
    data: {
      archivedAt: null,
      archivedByMembershipId: null,
    },
  });
}
