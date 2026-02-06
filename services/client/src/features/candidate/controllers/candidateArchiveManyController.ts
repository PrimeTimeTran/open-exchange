import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { candidateArchiveManyInputSchema as candidateArchiveManyInputSchema } from 'src/features/candidate/candidateSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const candidateArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/candidate/archive',
  request: {
    query: candidateArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function candidateArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.candidateArchive,
    context,
  );

  const { ids } = candidateArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.candidate.updateMany({
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
