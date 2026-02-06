import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { jobRestoreManyInputSchema } from 'src/features/job/jobSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const jobRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/job/restore',
  request: {
    query: jobRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function jobRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.jobRestore,
    context,
  );

  const { ids } = jobRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.job.updateMany({
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
