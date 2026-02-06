import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { MembershipStatus } from 'src/features/membership/MembershipStatus';
import { membershipDeclineInvitationInputSchema } from 'src/features/membership/membershipSchemas';
import { validateIsSignedInAndEmailVerified } from 'src/features/security';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import Error403 from 'src/shared/errors/Error403';

export const membershipDeclineInvitationApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/membership/invitation',
  request: {
    body: {
      content: {
        'application/json': {
          schema: membershipDeclineInvitationInputSchema,
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

export async function membershipDeclineInvitationController(
  body: unknown,
  context: AppContext,
) {
  validateIsSignedInAndEmailVerified(context);

  const { token } = membershipDeclineInvitationInputSchema.parse(body);

  const prisma = prismaDangerouslyBypassAuth(context);

  const membership = await prisma.membership.findUnique({
    where: { invitationToken: token },
  });

  if (!membership || !MembershipStatus.isInvited(membership)) {
    throw new Error400(context.dictionary.membership.errors.notInvited);
  }

  if (membership.userId !== context.currentUser?.id) {
    throw new Error403();
  }

  await prisma.membership.delete({
    where: {
      invitationToken: token,
    },
  });
}
