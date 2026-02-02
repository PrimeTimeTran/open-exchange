import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import { auditLogOperations } from 'src/features/auditLog/auditLogOperations';
import { authCreateAuditLog } from 'src/features/auth/authCreateAuditLog';
import { authFacebookValidateCode } from 'src/features/auth/authFacebookOauth';
import { authGithubValidateCode } from 'src/features/auth/authGithubOauth';
import { authGoogleValidateCode } from 'src/features/auth/authGoogleOauth';
import { authOauthSchema } from 'src/features/auth/authSchemas';
import { membershipAcceptInvitation } from 'src/features/membership/membershipAcceptInvitation';
import { tenantOnboardSingleTenant } from 'src/features/tenant/tenantOnboardSingleTenant';
import {
  prismaDangerouslyBypassAuth,
  prismaTransactionDangerouslyBypassAuth,
} from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';
import { jwtSign } from 'src/shared/lib/jwt';

export const authOauthApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/auth/:oauthProvider/callback',
  request: {
    query: authOauthSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function authOauthController(body: unknown, context: AppContext) {
  const { code, invitationToken, oauthProvider } = authOauthSchema.parse(body);

  const { email, firstName, lastName } =
    oauthProvider === 'google'
      ? await authGoogleValidateCode(code)
      : oauthProvider === 'facebook'
      ? await authFacebookValidateCode(code)
      : await authGithubValidateCode(code);
  const prisma = prismaDangerouslyBypassAuth(context);

  let auditLogOperation:string = auditLogOperations.signIn;
  let userWithMemberships = await prisma.user.findFirst({
    where: {
      email,
    },
    include: {
      memberships: true,
    },
  });

  if (!userWithMemberships) {
    auditLogOperation = auditLogOperations.signUp;
    userWithMemberships = await prisma.user.create({
      data: {
        email,
        emailVerified: true,
      },
      include: {
        memberships: true,
      },
    });
  }

  const queries: Prisma.PrismaPromise<any>[] = [];
  context.currentUser = userWithMemberships;
  let acceptInvitationResponse;

  if (invitationToken) {
    try {
      acceptInvitationResponse = await membershipAcceptInvitation(
        userWithMemberships,
        invitationToken,
        true,
        { firstName, lastName },
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
      userWithMemberships,
      { firstName, lastName },
      context,
    );

    queries.push(...onboardSingleTenantQueries);
  }

  const prismaWT = prismaTransactionDangerouslyBypassAuth(context);
  await prismaWT.$transaction(queries);

  userWithMemberships = await prisma.user.findUniqueOrThrow({
    where: { id: userWithMemberships.id },
    include: {
      memberships: true,
    },
  });

  await authCreateAuditLog(
    userWithMemberships,
    auditLogOperation,
    context,
  );

  const token = jwtSign({ id: userWithMemberships.id });
  return { token };
}
