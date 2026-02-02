import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FillList from 'src/features/fill/components/FillList';
import { fillPermissions } from 'src/features/fill/fillPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.fill.list.title,
  };
}

export default async function FillListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(fillPermissions.fillRead, context)) {
    return redirect('/');
  }

  return <FillList context={context} />;
}
