import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { jobFindSchema } from 'src/features/job/jobSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const jobFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/job/{id}',
  request: {
    params: jobFindSchema,
  },
  responses: {
    200: {
      description: 'Job',
    },
  },
};

export async function jobFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.jobRead,
    context,
  );

  const { id } = jobFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let job = await prisma.job.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {

      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  job = await filePopulateDownloadUrlInTree(job);

  return job;
}
