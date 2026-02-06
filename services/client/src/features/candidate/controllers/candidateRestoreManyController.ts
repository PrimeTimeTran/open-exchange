import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { candidateRestoreManyInputSchema } from 'src/features/candidate/candidateSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const candidateRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/candidate/restore',
  request: {
    query: candidateRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function candidateRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.candidateRestore,
    context,
  );

  const { ids } = candidateRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.candidate.updateMany({
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
