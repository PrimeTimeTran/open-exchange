import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReferralView } from 'src/features/referral/components/ReferralView';
import { referralPermissions } from 'src/features/referral/referralPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.referral.view.title,
  };
}

export default async function ReferralViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(referralPermissions.referralRead, context)) {
    redirect('/');
  }

  return <ReferralView id={params.id} context={context} />;
}
