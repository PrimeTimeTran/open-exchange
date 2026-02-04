import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SystemAccountEdit from 'src/features/systemAccount/components/SystemAccountEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.systemAccount.edit.title,
  };
}

export default async function SystemAccountEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.systemAccountUpdate, context)) {
    return redirect('/');
  }

  return <SystemAccountEdit context={context} id={params.id} />;
}
