import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { membershipFullName } from 'src/features/membership/membershipFullName';
import {
  membershipUpdateInputSchema,
  membershipUpdateParamsSchema,
} from 'src/features/membership/membershipSchemas';
import { permissions } from 'src/features/permissions';
import { roles } from 'src/features/roles';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';

export const membershipUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/membership/{id}',
  request: {
    params: membershipUpdateParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: membershipUpdateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Membership',
    },
  },
};

export async function membershipUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.membershipUpdate, context);

  const { id } = membershipUpdateParamsSchema.parse(params);

  const data = membershipUpdateInputSchema.parse(body);

  const prisma = prismaAuth(context);

  const existingMembership = await prisma.membership.findUnique({
    where: { id },
  });

  const isPreviouslyAdmin = existingMembership?.roles.some(
    (role) => role === roles.admin,
  );

  const hasAdminOnUpdate = data.roles?.some((role) => role === roles.admin);

  const isSelf = existingMembership?.userId === context.currentUser?.id;

  if (isSelf && isPreviouslyAdmin && !hasAdminOnUpdate) {
    throw new Error400(
      context.dictionary.membership.errors.cannotRemoveSelfAdminRole,
    );
  }

  let membership = await prisma.membership.update({
    where: { id },
    data: {
      ...data,
      fullName: membershipFullName(data),
    },
  });

  membership = await filePopulateDownloadUrlInTree(membership);

  return membership;
}
