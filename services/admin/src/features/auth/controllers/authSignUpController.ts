import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import dayjs from 'dayjs';
import { auditLogOperations } from 'src/features/auditLog/auditLogOperations';
import { authCreateAuditLog } from 'src/features/auth/authCreateAuditLog';
import { authSignUpInputSchema } from 'src/features/auth/authSchemas';
import { authSendVerifyEmailEmail } from 'src/features/auth/authSendVerifyEmail';
import { membershipAcceptInvitation } from 'src/features/membership/membershipAcceptInvitation';
import { tenantOnboardSingleTenant } from 'src/features/tenant/tenantOnboardSingleTenant';
import {
  prismaDangerouslyBypassAuth,
  prismaTransactionDangerouslyBypassAuth,
} from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { Logger } from 'src/shared/lib/Logger';
import { hashSecret } from 'src/shared/lib/hashSecret';
import { jwtSign } from 'src/shared/lib/jwt';
import { recaptchaVerification } from 'src/shared/lib/recaptchaVerification';
import uniqid from 'uniqid';

export const authSignUpApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/auth/sign-up',
  request: {
    body: {
      content: {
        'application/json': {
          schema: authSignUpInputSchema,
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

export async function authSignUpController(body: unknown, context: AppContext) {
  const { email, password, invitationToken, recaptchaToken } =
    authSignUpInputSchema.parse(body);

  await recaptchaVerification(recaptchaToken, context.dictionary);

  const prisma = prismaDangerouslyBypassAuth(context);

  let user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (user?.password) {
    throw new Error400(context.dictionary.auth.errors.emailAlreadyInUse);
  }

  if (!user) {
    // User id is used on all next queries, that's why it's transaction is
    // run before the other ones. If error occurs, user can still retry this sign-up process
    // bc the password is not set here
    user = await prisma.user.create({
      data: {
        email,
        emailVerified:
          String(process.env.AUTH_BYPASS_EMAIL_VERIFICATION) === 'true',
      },
    });
  }

  const queries = [];

  context.currentUser = user;

  const prismaWT = prismaTransactionDangerouslyBypassAuth(context);

  const hashedPassword = await hashSecret(password);
  const userUpdatePasswordQuery = prismaWT.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
    },
  });

  queries.push(userUpdatePasswordQuery);

  let emailVerified = user.emailVerified;

  let acceptInvitationResponse;

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

      emailVerified = acceptInvitationResponse.emailVerified;
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

  let verifyEmailToken = null;

  if (!emailVerified) {
    verifyEmailToken = uniqid();

    const verifyEmailTokenQuery = prismaWT.user.update({
      where: { id: user.id },
      data: {
        verifyEmailToken: verifyEmailToken,
        verifyEmailTokenExpiresAt: dayjs().add(1, 'day').toDate(),
      },
    });

    queries.push(verifyEmailTokenQuery);
  }

  await prismaWT.$transaction(queries);

  if (verifyEmailToken) {
    await authSendVerifyEmailEmail(user.email, verifyEmailToken, context);
  }

  let userWithMemberships = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: {
      memberships: true,
    },
  });

  await authCreateAuditLog(
    userWithMemberships,
    auditLogOperations.signUp,
    context,
  );

  const token = jwtSign({ id: user.id });
  return { token };
}
