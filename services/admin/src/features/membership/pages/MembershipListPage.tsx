import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MembershipList from 'src/features/membership/components/MembershipList';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.membership.list.title,
  };
}

export default async function MembershipListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.membershipRead, context)) {
    return redirect('/');
  }

  return <MembershipList context={context} />;
}
