import { AppContext } from 'src/shared/controller/appContext';
import { sendEmail } from 'src/shared/lib/sendEmail';
import { formatTranslation } from 'src/translation/formatTranslation';

export async function authSendVerifyEmailEmail(
  email: string,
  token: string,
  context: AppContext,
) {
  const link = `${process.env.FRONTEND_URL}/auth/verify-email/confirm?token=${token}`;
  const subject = formatTranslation(
    context.dictionary.emails.verifyEmailEmail.subject,
    context.dictionary.projectName,
  );
  const content = formatTranslation(
    context.dictionary.emails.verifyEmailEmail.content,
    context.dictionary.projectName,
    link,
  );
  await sendEmail(email, null, subject, content);
}
