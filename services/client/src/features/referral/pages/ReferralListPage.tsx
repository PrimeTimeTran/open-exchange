import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ReferralList from 'src/features/referral/components/ReferralList';
import { referralPermissions } from 'src/features/referral/referralPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.referral.list.title,
  };
}

export default async function ReferralListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(referralPermissions.referralRead, context)) {
    return redirect('/');
  }

  return <ReferralList context={context} />;
}
