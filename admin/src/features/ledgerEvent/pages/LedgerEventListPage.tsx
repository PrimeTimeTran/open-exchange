import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LedgerEventList from 'src/features/ledgerEvent/components/LedgerEventList';
import { ledgerEventPermissions } from 'src/features/ledgerEvent/ledgerEventPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.ledgerEvent.list.title,
  };
}

export default async function LedgerEventListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(ledgerEventPermissions.ledgerEventRead, context)) {
    return redirect('/');
  }

  return <LedgerEventList context={context} />;
}
