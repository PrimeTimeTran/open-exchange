import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import dayjs from 'dayjs';
import { auditLogOperations } from 'src/features/auditLog/auditLogOperations';
import { authCreateAuditLog } from 'src/features/auth/authCreateAuditLog';
import { authPasswordResetRequestInputSchema } from 'src/features/auth/authSchemas';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { recaptchaVerification } from 'src/shared/lib/recaptchaVerification';
import { sendEmail } from 'src/shared/lib/sendEmail';
import { formatTranslation } from 'src/translation/formatTranslation';
import uniqid from 'uniqid';

export const authPasswordResetRequestApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/auth/password-reset/request',
  request: {
    body: {
      content: {
        'application/json': {
          schema: authPasswordResetRequestInputSchema,
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

export async function authPasswordResetRequestController(
  body: unknown,
  context: AppContext,
) {
  const { email, recaptchaToken } =
    authPasswordResetRequestInputSchema.parse(body);
  await recaptchaVerification(recaptchaToken, context.dictionary);

  const prisma = prismaDangerouslyBypassAuth(context);

  let user = await prisma.user.findFirst({
    where: {
      email,
    },
    include: {
      memberships: true,
    },
  });

  if (!user) {
    throw new Error400(context.dictionary.auth.errors.emailNotFound);
  }

  const passwordResetToken = uniqid();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken,
      passwordResetTokenExpiresAt: dayjs().add(1, 'day').toDate(),
    },
  });

  const link = `${process.env.FRONTEND_URL}/auth/password-reset/confirm?token=${passwordResetToken}`;

  const subject = formatTranslation(
    context.dictionary.emails.passwordResetEmail.subject,
    context.dictionary.projectName,
  );
  const content = formatTranslation(
    context.dictionary.emails.passwordResetEmail.content,
    context.dictionary.projectName,
    link,
  );
  await sendEmail(user.email, null, subject, content);

  await authCreateAuditLog(
    user,
    auditLogOperations.passwordResetRequest,
    context,
  );
}
