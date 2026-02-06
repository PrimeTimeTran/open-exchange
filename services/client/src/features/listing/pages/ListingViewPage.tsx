import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ListingView } from 'src/features/listing/components/ListingView';
import { listingPermissions } from 'src/features/listing/listingPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.listing.view.title,
  };
}

export default async function ListingViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(listingPermissions.listingRead, context)) {
    redirect('/');
  }

  return <ListingView id={params.id} context={context} />;
}
