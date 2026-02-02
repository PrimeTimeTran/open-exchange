import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import Subscription from 'src/features/subscription/components/Subscription';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.subscription.title,
  };
}

export default async function SubscriptionPage() {
  const context = await appContextForReact(cookies());

  if (process.env.NEXT_PUBLIC_SUBSCRIPTION_MODE === 'disabled') {
    return redirect('/');
  }

  if (!hasPermission(permissions.subscriptionRead, context)) {
    return redirect('/');
  }

  return <Subscription context={context} />;
}
