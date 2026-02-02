import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { instrumentRestoreManyInputSchema } from 'src/features/instrument/instrumentSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const instrumentRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/instrument/restore',
  request: {
    query: instrumentRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function instrumentRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.instrumentRestore,
    context,
  );

  const { ids } = instrumentRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.instrument.updateMany({
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
