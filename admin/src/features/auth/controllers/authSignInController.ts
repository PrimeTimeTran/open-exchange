import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import { auditLogOperations } from 'src/features/auditLog/auditLogOperations';
import { authCreateAuditLog } from 'src/features/auth/authCreateAuditLog';
import { authSignInInputSchema } from 'src/features/auth/authSchemas';
import { membershipAcceptInvitation } from 'src/features/membership/membershipAcceptInvitation';
import { tenantOnboardSingleTenant } from 'src/features/tenant/tenantOnboardSingleTenant';
import {
  prismaDangerouslyBypassAuth,
  prismaTransactionDangerouslyBypassAuth,
} from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { Logger } from 'src/shared/lib/Logger';
import { isHashEqual } from 'src/shared/lib/isHashEqual';
import { jwtSign } from 'src/shared/lib/jwt';
import { recaptchaVerification } from 'src/shared/lib/recaptchaVerification';

export const authSignInApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/auth/sign-in',
  request: {
    body: {
      content: {
        'application/json': {
          schema: authSignInInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'JWT Token',
    },
  },
};

export async function authSignInController(body: unknown, context: AppContext) {
  const { email, password, invitationToken, recaptchaToken } =
    authSignInInputSchema.parse(body);

  await recaptchaVerification(recaptchaToken, context.dictionary);

  const prisma = prismaDangerouslyBypassAuth(context);

  let user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error400(context.dictionary.auth.errors.userNotFound);
  }

  if (!user.password) {
    throw new Error400(context.dictionary.auth.errors.wrongPassword);
  }

  const passwordsMatch = await isHashEqual(password, user.password);

  if (!passwordsMatch) {
    throw new Error400(context.dictionary.auth.errors.wrongPassword);
  }

  let acceptInvitationResponse;

  const queries: Prisma.PrismaPromise<any>[] = [];

  context.currentUser = user;

  if (invitationToken) {
    try {
      acceptInvitationResponse = await membershipAcceptInvitation(
        user,
        invitationToken,
        true,
        null,
        false,
        context,
      );

      queries.push(...acceptInvitationResponse.acceptInvitationQueries);
    } catch (error) {
      // If invitation token is invalid, we still want to create the user
      Logger.warn(error);
    }
  }

  const isInvitationAccepted = Boolean(acceptInvitationResponse);

  if (
    !isInvitationAccepted &&
    process.env.NEXT_PUBLIC_TENANT_MODE === 'single'
  ) {
    const { onboardSingleTenantQueries } = await tenantOnboardSingleTenant(
      user,
      null,
      context,
    );

    queries.push(...onboardSingleTenantQueries);
  }

  const prismaWT = prismaTransactionDangerouslyBypassAuth(context);
  await prismaWT.$transaction(queries);

  let userWithMemberships = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: {
      memberships: true,
    },
  });

  await authCreateAuditLog(
    userWithMemberships,
    auditLogOperations.signIn,
    context,
  );

  const token = jwtSign({ id: user.id });
  return { token };
}
