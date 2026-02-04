import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { instrumentArchiveManyInputSchema as instrumentArchiveManyInputSchema } from 'src/features/instrument/instrumentSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const instrumentArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/instrument/archive',
  request: {
    query: instrumentArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function instrumentArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.instrumentArchive,
    context,
  );

  const { ids } = instrumentArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.instrument.updateMany({
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
