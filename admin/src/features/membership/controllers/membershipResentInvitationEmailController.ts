import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { membershipResendInvitationEmailInputSchema } from 'src/features/membership/membershipSchemas';
import { membershipSendInvitationEmail } from 'src/features/membership/membershipSendInvitationEmail';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error404 from 'src/shared/errors/Error404';

export const membershipResendInvitationEmailApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/membership/{id}/resend-invitation-email',
  request: {
    params: membershipResendInvitationEmailInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function membershipResendInvitationEmailController(
  params: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.membershipResendInvitationEmail, context);

  const prisma = prismaAuth(context);

  const { id } = membershipResendInvitationEmailInputSchema.parse(params);

  const membership = await prisma.membership.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  if (!membership?.invitationToken) {
    throw new Error404();
  }

  if (!membership?.user?.email) {
    throw new Error404();
  }

  return await membershipSendInvitationEmail(
    membership?.user?.email,
    membership.invitationToken,
    context,
  );
}
