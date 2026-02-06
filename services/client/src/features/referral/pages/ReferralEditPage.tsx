import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ReferralEdit from 'src/features/referral/components/ReferralEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.referral.edit.title,
  };
}

export default async function ReferralEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.referralUpdate, context)) {
    return redirect('/');
  }

  return <ReferralEdit context={context} id={params.id} />;
}
