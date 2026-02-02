import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ApiKeyList from 'src/features/apiKey/components/ApiKeyList';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.apiKey.list.title,
  };
}

export default async function ApiKeyListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.apiKeyRead, context)) {
    return redirect('/');
  }

  return <ApiKeyList context={context} />;
}
