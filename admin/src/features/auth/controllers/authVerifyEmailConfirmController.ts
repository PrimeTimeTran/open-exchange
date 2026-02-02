import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { auditLogOperations } from 'src/features/auditLog/auditLogOperations';
import { authCreateAuditLog } from 'src/features/auth/authCreateAuditLog';
import { authVerifyEmailConfirmInputSchema } from 'src/features/auth/authSchemas';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { jwtSign } from 'src/shared/lib/jwt';
import { recaptchaVerification } from 'src/shared/lib/recaptchaVerification';

export const authVerifyEmailConfirmApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/auth/verify-email/confirm',
  request: {
    body: {
      content: {
        'application/json': {
          schema: authVerifyEmailConfirmInputSchema,
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

export async function authVerifyEmailConfirmController(
  body: unknown,
  context: AppContext,
) {
  const { token, recaptchaToken } =
    authVerifyEmailConfirmInputSchema.parse(body);

  await recaptchaVerification(recaptchaToken, context.dictionary);

  const prisma = prismaDangerouslyBypassAuth(context);

  let user = await prisma.user.findFirst({
    where: {
      verifyEmailToken: token,
      verifyEmailTokenExpiresAt: {
        gt: new Date(),
      },
    },
    include: {
      memberships: true,
    },
  });

  if (!user) {
    throw new Error400(context.dictionary.auth.errors.invalidVerifyEmailToken);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verifyEmailToken: null,
      verifyEmailTokenExpiresAt: null,
      emailVerified: true,
    },
  });

  await authCreateAuditLog(
    user,
    auditLogOperations.verifyEmailConfirm,
    context,
  );

  return { token: jwtSign({ id: user.id }) };
}
