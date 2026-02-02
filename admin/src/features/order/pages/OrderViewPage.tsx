import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { OrderView } from 'src/features/order/components/OrderView';
import { orderPermissions } from 'src/features/order/orderPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.order.view.title,
  };
}

export default async function OrderViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(orderPermissions.orderRead, context)) {
    redirect('/');
  }

  return <OrderView id={params.id} context={context} />;
}
