import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { jobArchiveManyInputSchema as jobArchiveManyInputSchema } from 'src/features/job/jobSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const jobArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/job/archive',
  request: {
    query: jobArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function jobArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.jobArchive,
    context,
  );

  const { ids } = jobArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.job.updateMany({
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
