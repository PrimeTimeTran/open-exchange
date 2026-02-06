import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chaterArchiveManyInputSchema as chaterArchiveManyInputSchema } from 'src/features/chater/chaterSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const chaterArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/chater/archive',
  request: {
    query: chaterArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function chaterArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chaterArchive,
    context,
  );

  const { ids } = chaterArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.chater.updateMany({
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
