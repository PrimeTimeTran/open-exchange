import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MembershipView } from 'src/features/membership/components/MembershipView';
import { membershipPermissions } from 'src/features/membership/membershipPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.membership.view.title,
  };
}

export default async function MembershipViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(membershipPermissions.membershipRead, context)) {
    redirect('/');
  }

  return <MembershipView id={params.id} context={context} />;
}
