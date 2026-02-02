import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MembershipEdit from 'src/features/membership/components/MembershipEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.membership.edit.title,
  };
}

export default async function MembershipEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.membershipUpdate, context)) {
    return redirect('/');
  }

  return <MembershipEdit context={context} id={params.id} />;
}
