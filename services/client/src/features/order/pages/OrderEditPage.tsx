import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import OrderEdit from 'src/features/order/components/OrderEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.order.edit.title,
  };
}

export default async function OrderEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.orderUpdate, context)) {
    return redirect('/');
  }

  return <OrderEdit context={context} id={params.id} />;
}
