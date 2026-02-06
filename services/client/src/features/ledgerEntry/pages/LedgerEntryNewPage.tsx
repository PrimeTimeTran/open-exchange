import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LedgerEntryNew from 'src/features/ledgerEntry/components/LedgerEntryNew';
import { ledgerEntryPermissions } from 'src/features/ledgerEntry/ledgerEntryPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.ledgerEntry.new.title,
  };
}

export default async function LedgerEntryNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(ledgerEntryPermissions.ledgerEntryCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.ledgerEntry.list.menu, '/ledger-entry'],
          [dictionary.ledgerEntry.new.menu],
        ]}
      />
      <div className="my-10">
        <LedgerEntryNew context={context} />
      </div>
    </div>
  );
}
