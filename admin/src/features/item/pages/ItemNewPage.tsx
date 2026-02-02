import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ItemNew from 'src/features/item/components/ItemNew';
import { itemPermissions } from 'src/features/item/itemPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.item.new.title,
  };
}

export default async function ItemNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(itemPermissions.itemCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.item.list.menu, '/item'],
          [dictionary.item.new.menu],
        ]}
      />
      <div className="my-10">
        <ItemNew context={context} />
      </div>
    </div>
  );
}
