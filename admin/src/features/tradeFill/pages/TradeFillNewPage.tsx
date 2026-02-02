import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TradeFillNew from 'src/features/tradeFill/components/TradeFillNew';
import { tradeFillPermissions } from 'src/features/tradeFill/tradeFillPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.tradeFill.new.title,
  };
}

export default async function TradeFillNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(tradeFillPermissions.tradeFillCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.tradeFill.list.menu, '/trade-fill'],
          [dictionary.tradeFill.new.menu],
        ]}
      />
      <div className="my-10">
        <TradeFillNew context={context} />
      </div>
    </div>
  );
}
