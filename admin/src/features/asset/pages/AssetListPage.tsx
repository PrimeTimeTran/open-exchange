import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AssetList from 'src/features/asset/components/AssetList';
import { assetPermissions } from 'src/features/asset/assetPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.asset.list.title,
  };
}

export default async function AssetListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(assetPermissions.assetRead, context)) {
    return redirect('/');
  }

  return <AssetList context={context} />;
}
