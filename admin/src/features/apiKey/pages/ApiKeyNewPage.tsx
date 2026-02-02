import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ApiKeyNew from 'src/features/apiKey/components/ApiKeyNew';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.apiKey.new.title,
  };
}

export default async function ApiKeyNewPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.apiKeyCreate, context)) {
    return redirect('/');
  }

  const dictionary = context.dictionary;

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.apiKey.list.menu, '/api-key'],
          [dictionary.apiKey.new.menu],
        ]}
      />
      <div className="my-10">
        <ApiKeyNew context={context} />
      </div>
    </div>
  );
}
