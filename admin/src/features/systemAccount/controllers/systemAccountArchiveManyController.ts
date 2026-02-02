import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { systemAccountArchiveManyInputSchema as systemAccountArchiveManyInputSchema } from 'src/features/systemAccount/systemAccountSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const systemAccountArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/system-account/archive',
  request: {
    query: systemAccountArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function systemAccountArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.systemAccountArchive,
    context,
  );

  const { ids } = systemAccountArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.systemAccount.updateMany({
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
