import { AppContext } from 'src/shared/controller/appContext';
import { sendEmail } from 'src/shared/lib/sendEmail';
import { formatTranslation } from 'src/translation/formatTranslation';

export async function membershipSendInvitationEmail(
  email: string,
  token: string,
  context: AppContext,
) {
  const link = `${
    process.env.FRONTEND_URL
  }/auth/invitation?token=${token}&email=${encodeURIComponent(email)}`;
  const subject =
    process.env.NEXT_PUBLIC_TENANT_MODE === 'single'
      ? formatTranslation(
          context.dictionary.emails.invitationEmail.singleTenant.subject,
          context?.dictionary.projectName,
        )
      : formatTranslation(
          context.dictionary.emails.invitationEmail.multiTenant.subject,
          context?.dictionary.projectName,
          context?.currentTenant?.name || '',
        );

  const content =
    process.env.NEXT_PUBLIC_TENANT_MODE === 'single'
      ? formatTranslation(
          context.dictionary.emails.invitationEmail.singleTenant.content,
          context.dictionary.projectName,
          link,
        )
      : formatTranslation(
          context.dictionary.emails.invitationEmail.multiTenant.content,
          context.dictionary.projectName,
          link,
          context?.currentTenant?.name || '',
        );

  await sendEmail(email, null, subject, content);
}
