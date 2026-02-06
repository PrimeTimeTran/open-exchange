import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { jobCreateInputSchema } from 'src/features/job/jobSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const jobCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/job',
  request: {
    body: {
      content: {
        'application/json': {
          schema: jobCreateInputSchema,
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

export async function jobCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.jobCreate, context);
  return await jobCreate(body, context);
}

export async function jobCreate(body: unknown, context: AppContext) {
  const data = jobCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let job = await prisma.job.create({
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
      importHash: data.importHash,
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
