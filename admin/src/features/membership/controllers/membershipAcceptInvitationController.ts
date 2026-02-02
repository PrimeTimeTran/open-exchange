import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { User } from '@prisma/client';
import { membershipAcceptInvitation } from 'src/features/membership/membershipAcceptInvitation';
import { membershipAcceptInvitationInputSchema } from 'src/features/membership/membershipSchemas';
import { AppContext } from 'src/shared/controller/appContext';

export const membershipAcceptInvitationApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/membership/invitation',
  request: {
    body: {
      content: {
        'application/json': {
          schema: membershipAcceptInvitationInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function membershipAcceptInvitationController(
  body: unknown,
  context: AppContext,
) {
  const data = membershipAcceptInvitationInputSchema.parse(body);

  return await membershipAcceptInvitation(
    context.currentUser as User,
    data.token,
    data.forceAcceptOtherEmail,
    null,
    true,
    context,
  );
}
