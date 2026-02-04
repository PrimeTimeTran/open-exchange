import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiKeyLabel } from 'src/features/apiKey/apiKeyLabel';
import ApiKeyEdit from 'src/features/apiKey/components/ApiKeyEdit';
import { apiKeyFindManyController } from 'src/features/apiKey/controllers/apiKeyFindManyController';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { cleanObjectForServerComponent } from 'src/shared/lib/mapObjectForServerComponent';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.apiKey.edit.title,
  };
}

export default async function ApiKeyEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.apiKeyUpdate, context)) {
    return redirect('/');
  }

  const dictionary = context.dictionary;

  const { apiKeys } = await apiKeyFindManyController(
    { filter: { id: params.id } },
    context,
  );

  if (!apiKeys[0]) {
    return redirect('/api-key');
  }

  const apiKey = cleanObjectForServerComponent(apiKeys[0]);

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.apiKey.list.menu, '/api-key'],
          [apiKeyLabel(apiKey, dictionary), `/api-key/${apiKey?.id}`],
          [dictionary.apiKey.edit.menu],
        ]}
      />
      <div className="my-10">
        <ApiKeyEdit context={context} apiKey={apiKey} />
      </div>
    </div>
  );
}
