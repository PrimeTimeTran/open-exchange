import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { candidateFindSchema } from 'src/features/candidate/candidateSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const candidateFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/candidate/{id}',
  request: {
    params: candidateFindSchema,
  },
  responses: {
    200: {
      description: 'Candidate',
    },
  },
};

export async function candidateFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.candidateRead,
    context,
  );

  const { id } = candidateFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let candidate = await prisma.candidate.findUnique({
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
