import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ItemList from 'src/features/item/components/ItemList';
import { itemPermissions } from 'src/features/item/itemPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.item.list.title,
  };
}

export default async function ItemListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(itemPermissions.itemRead, context)) {
    return redirect('/');
  }

  return <ItemList context={context} />;
}
