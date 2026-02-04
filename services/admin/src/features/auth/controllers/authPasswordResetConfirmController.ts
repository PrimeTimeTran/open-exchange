import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { auditLogOperations } from 'src/features/auditLog/auditLogOperations';
import { authCreateAuditLog } from 'src/features/auth/authCreateAuditLog';
import { authPasswordResetConfirmInputSchema } from 'src/features/auth/authSchemas';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { hashSecret } from 'src/shared/lib/hashSecret';
import { recaptchaVerification } from 'src/shared/lib/recaptchaVerification';

export const authPasswordResetConfirmApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/auth/password-reset/confirm',
  request: {
    body: {
      content: {
        'application/json': {
          schema: authPasswordResetConfirmInputSchema,
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

export async function authPasswordResetConfirmController(
  body: unknown,
  context: AppContext,
) {
  const { token, password, recaptchaToken } =
    authPasswordResetConfirmInputSchema.parse(body);

  await recaptchaVerification(recaptchaToken, context.dictionary);

  const prisma = prismaDangerouslyBypassAuth(context);

  let user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetTokenExpiresAt: {
        gt: new Date(),
      },
    },
    include: {
      memberships: true,
    },
  });

  if (!user) {
    throw new Error400(
      context.dictionary.auth.errors.invalidPasswordResetToken,
    );
  }

  const hashedPassword = await hashSecret(password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: null,
      passwordResetTokenExpiresAt: null,
      password: hashedPassword,
      expireSessionsOlderThan: new Date(),
    },
  });

  await authCreateAuditLog(
    user,
    auditLogOperations.passwordResetConfirm,
    context,
  );
}
