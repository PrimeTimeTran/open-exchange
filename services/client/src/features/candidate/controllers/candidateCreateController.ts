import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { candidateCreateInputSchema } from 'src/features/candidate/candidateSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const candidateCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/candidate',
  request: {
    body: {
      content: {
        'application/json': {
          schema: candidateCreateInputSchema,
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

export async function candidateCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.candidateCreate, context);
  return await candidateCreate(body, context);
}

export async function candidateCreate(body: unknown, context: AppContext) {
  const data = candidateCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let candidate = await prisma.candidate.create({
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
      importHash: data.importHash,
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
