import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  jobUpdateBodyInputSchema,
  jobUpdateParamsInputSchema,
} from 'src/features/job/jobSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const jobUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/job/{id}',
  request: {
    params: jobUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: jobUpdateBodyInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Job',
    },
  },
};

export async function jobUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.jobUpdate,
    context,
  );

  const { id } = jobUpdateParamsInputSchema.parse(params);

  const data = jobUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.job.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      title: data.title,
      team: data.team,
      location: data.location,
      type: data.type,
      remote: data.remote,
      description: data.description,
      requirements: data.requirements,
      responsibilities: data.responsibilities,
      quantity: data.quantity,
      salaryLow: data.salaryLow,
      salaryHigh: data.salaryHigh,
      status: data.status,
      seniority: data.seniority,
      currency: data.currency,
      meta: data.meta,
    },
  });

  let job = await prisma.job.findUniqueOrThrow({
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
