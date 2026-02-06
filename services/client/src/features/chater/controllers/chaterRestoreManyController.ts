import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chaterRestoreManyInputSchema } from 'src/features/chater/chaterSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const chaterRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/chater/restore',
  request: {
    query: chaterRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function chaterRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chaterRestore,
    context,
  );

  const { ids } = chaterRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.chater.updateMany({
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
