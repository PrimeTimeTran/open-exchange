import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AssetNew from 'src/features/asset/components/AssetNew';
import { assetPermissions } from 'src/features/asset/assetPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.asset.new.title,
  };
}

export default async function AssetNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(assetPermissions.assetCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.asset.list.menu, '/asset'],
          [dictionary.asset.new.menu],
        ]}
      />
      <div className="my-10">
        <AssetNew context={context} />
      </div>
    </div>
  );
}
