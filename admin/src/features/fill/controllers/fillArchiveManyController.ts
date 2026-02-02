import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { fillArchiveManyInputSchema as fillArchiveManyInputSchema } from 'src/features/fill/fillSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const fillArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/fill/archive',
  request: {
    query: fillArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function fillArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.fillArchive,
    context,
  );

  const { ids } = fillArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.fill.updateMany({
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
