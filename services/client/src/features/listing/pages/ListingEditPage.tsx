import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ListingEdit from 'src/features/listing/components/ListingEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.listing.edit.title,
  };
}

export default async function ListingEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.listingUpdate, context)) {
    return redirect('/');
  }

  return <ListingEdit context={context} id={params.id} />;
}
