import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { referralArchiveManyInputSchema as referralArchiveManyInputSchema } from 'src/features/referral/referralSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const referralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/referral/archive',
  request: {
    query: referralArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function referralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.referralArchive,
    context,
  );

  const { ids } = referralArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.referral.updateMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
    data: {
      archivedAt: new Date(),
      archivedByMembershipId: context.currentMembership!.id,
    },
  });
}
