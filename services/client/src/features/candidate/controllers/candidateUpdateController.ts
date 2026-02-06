import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  candidateUpdateBodyInputSchema,
  candidateUpdateParamsInputSchema,
} from 'src/features/candidate/candidateSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const candidateUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/candidate/{id}',
  request: {
    params: candidateUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: candidateUpdateBodyInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Candidate',
    },
  },
};

export async function candidateUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.candidateUpdate,
    context,
  );

  const { id } = candidateUpdateParamsInputSchema.parse(params);

  const data = candidateUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.candidate.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      preferredName: data.preferredName,
      email: data.email,
      phone: data.phone,
      country: data.country,
      timezone: data.timezone,
      linkedinUrl: data.linkedinUrl,
      githubUrl: data.githubUrl,
      portfolioUrl: data.portfolioUrl,
      resumeUrl: data.resumeUrl,
      resume: data.resume,
      meta: data.meta,
    },
  });

  let candidate = await prisma.candidate.findUniqueOrThrow({
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

  candidate = await filePopulateDownloadUrlInTree(candidate);

  return candidate;
}
