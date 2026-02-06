import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ListingNew from 'src/features/listing/components/ListingNew';
import { listingPermissions } from 'src/features/listing/listingPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.listing.new.title,
  };
}

export default async function ListingNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(listingPermissions.listingCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.listing.list.menu, '/listing'],
          [dictionary.listing.new.menu],
        ]}
      />
      <div className="my-10">
        <ListingNew context={context} />
      </div>
    </div>
  );
}
