import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LedgerEntryList from 'src/features/ledgerEntry/components/LedgerEntryList';
import { ledgerEntryPermissions } from 'src/features/ledgerEntry/ledgerEntryPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.ledgerEntry.list.title,
  };
}

export default async function LedgerEntryListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(ledgerEntryPermissions.ledgerEntryRead, context)) {
    return redirect('/');
  }

  return <LedgerEntryList context={context} />;
}
