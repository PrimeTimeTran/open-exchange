import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import OrderNew from 'src/features/order/components/OrderNew';
import { orderPermissions } from 'src/features/order/orderPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.order.new.title,
  };
}

export default async function OrderNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(orderPermissions.orderCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.order.list.menu, '/order'],
          [dictionary.order.new.menu],
        ]}
      />
      <div className="my-10">
        <OrderNew context={context} />
      </div>
    </div>
  );
}
