import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ItemEdit from 'src/features/item/components/ItemEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.item.edit.title,
  };
}

export default async function ItemEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.itemUpdate, context)) {
    return redirect('/');
  }

  return <ItemEdit context={context} id={params.id} />;
}
