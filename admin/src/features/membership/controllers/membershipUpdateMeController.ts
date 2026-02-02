import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { membershipFullName } from 'src/features/membership/membershipFullName';
import { membershipUpdateMeInputSchema } from 'src/features/membership/membershipSchemas';
import { validateIsSignedIn } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const membershipUpdateMeApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/membership/me',
  request: {
    body: {
      content: {
        'application/json': {
          schema: membershipUpdateMeInputSchema,
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

export async function membershipUpdateMeController(
  body: unknown,
  context: AppContext,
) {
  validateIsSignedIn(context);

  const membershipInput = membershipUpdateMeInputSchema.parse(body);

  const prisma = prismaAuth(context);

  let membership = await prisma.membership.update({
    where: { id: context.currentMembership?.id },
    data: {
      ...membershipInput,
      fullName: membershipFullName(membershipInput),
    },
  });

  membership = await filePopulateDownloadUrlInTree(membership);

  return membership;
}
