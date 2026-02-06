import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { fillRestoreManyInputSchema } from 'src/features/fill/fillSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const fillRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/fill/restore',
  request: {
    query: fillRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function fillRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.fillRestore,
    context,
  );

  const { ids } = fillRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.fill.updateMany({
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
