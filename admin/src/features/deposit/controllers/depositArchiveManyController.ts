import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { depositArchiveManyInputSchema as depositArchiveManyInputSchema } from 'src/features/deposit/depositSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const depositArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/deposit/archive',
  request: {
    query: depositArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function depositArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.depositArchive,
    context,
  );

  const { ids } = depositArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.deposit.updateMany({
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
