import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { uniq } from 'lodash';
import { membershipFullName } from 'src/features/membership/membershipFullName';
import { membershipCreateInputSchema } from 'src/features/membership/membershipSchemas';
import { membershipSendInvitationEmail } from 'src/features/membership/membershipSendInvitationEmail';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { excludeFromObject } from 'src/shared/lib/excludeFromObject';
import { formatTranslation } from 'src/translation/formatTranslation';
import uniqid from 'uniqid';

export const membershipCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/membership',
  request: {
    body: {
      content: {
        'application/json': {
          schema: membershipCreateInputSchema,
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

export async function membershipCreateController(
  body: any,
  context: AppContext,
) {
  validateHasPermission(permissions.membershipCreate, context);
  return await membershipCreate(body, context);
}

export async function membershipCreate(body: any, context: AppContext) {
  const membership = membershipCreateInputSchema.parse(body);

  const prisma = prismaDangerouslyBypassAuth(context);

  if (
    await prisma.membership.findFirst({
      where: {
        tenantId: String(context?.currentTenant?.id),
        user: { email: membership.email },
      },
    })
  ) {
    throw new Error400(
      formatTranslation(
        context.dictionary.membership.errors.alreadyMember,
        membership.email,
      ),
    );
  }
  const membershipWithoutEmail = excludeFromObject({ ...membership }, [
    'email',
  ]);

  const fullName = membershipFullName(membershipWithoutEmail);

  const invitationToken = uniqid();

  const user = await prisma.user.upsert({
    where: { email: membership.email },
    create: {
      email: membership.email,
      emailVerified:
          String(process.env.AUTH_BYPASS_EMAIL_VERIFICATION) === 'true',
      memberships: {
        create: {
          ...membershipWithoutEmail,
          fullName,
          roles: uniq(membership.roles),
          invitationToken,
          tenantId: String(context?.currentTenant?.id),
        },
      },
    },
    update: {
      memberships: {
        create: {
          ...membershipWithoutEmail,
          fullName,
          roles: uniq(membership.roles),
          invitationToken,
          tenantId: String(context?.currentTenant?.id),
        },
      },
    },
  });

  await membershipSendInvitationEmail(
    membership.email,
    invitationToken,
    context,
  );

  return prisma.membership.findFirst({
    where: {
      userId: user.id,
      tenantId: String(context?.currentTenant?.id),
    },
  });
}
