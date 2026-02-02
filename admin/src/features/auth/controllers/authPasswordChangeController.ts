import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { auditLogOperations } from 'src/features/auditLog/auditLogOperations';
import { authCreateAuditLog } from 'src/features/auth/authCreateAuditLog';
import { authPasswordChangeInputSchema } from 'src/features/auth/authSchemas';
import { validateIsSignedIn } from 'src/features/security';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { hashSecret } from 'src/shared/lib/hashSecret';
import { isHashEqual } from 'src/shared/lib/isHashEqual';

export const authPasswordChangeApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/auth/password-change',
  request: {
    body: {
      content: {
        'application/json': {
          schema: authPasswordChangeInputSchema,
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

export async function authPasswordChangeController(
  body: unknown,
  context: AppContext,
) {
  const { currentUser } = validateIsSignedIn(context);

  const { oldPassword, newPassword } =
    authPasswordChangeInputSchema.parse(body);

  const prisma = prismaDangerouslyBypassAuth(context);

  const currentUserWithPassword = await prisma.user.findFirstOrThrow({
    where: { id: currentUser?.id },
    select: { password: true },
  });

  const arePasswordsEqual = await isHashEqual(
    oldPassword,
    currentUserWithPassword?.password,
  );

  if (!arePasswordsEqual) {
    throw new Error400(context.dictionary.auth.errors.wrongOldPassword);
  }

  const hashedNewPassword = await hashSecret(newPassword);

  await prisma.user.update({
    where: { id: currentUser?.id },
    data: {
      password: hashedNewPassword,
      expireSessionsOlderThan: new Date(),
    },
  });

  await authCreateAuditLog(
    currentUser,
    auditLogOperations.passwordChange,
    context,
  );
}
