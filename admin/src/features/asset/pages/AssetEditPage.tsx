import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AssetEdit from 'src/features/asset/components/AssetEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.asset.edit.title,
  };
}

export default async function AssetEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.assetUpdate, context)) {
    return redirect('/');
  }

  return <AssetEdit context={context} id={params.id} />;
}
