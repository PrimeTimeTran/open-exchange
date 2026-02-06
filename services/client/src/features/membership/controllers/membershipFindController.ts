import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { membershipFindInputSchema } from 'src/features/membership/membershipSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const membershipFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/membership/{id}',
  request: {
    params: membershipFindInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function membershipFindController(
  params: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.membershipRead, context);

  const prisma = prismaAuth(context);

  const { id } = membershipFindInputSchema.parse(params);

  let membership = await prisma.membership.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!membership) {
    return null;
  }

  membership.invitationToken = null;
  membership = await filePopulateDownloadUrlInTree(membership);

  return membership;
}
