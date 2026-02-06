import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ListingList from 'src/features/listing/components/ListingList';
import { listingPermissions } from 'src/features/listing/listingPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.listing.list.title,
  };
}

export default async function ListingListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(listingPermissions.listingRead, context)) {
    return redirect('/');
  }

  return <ListingList context={context} />;
}
