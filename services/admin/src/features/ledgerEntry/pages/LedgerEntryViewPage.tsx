import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LedgerEntryView } from 'src/features/ledgerEntry/components/LedgerEntryView';
import { ledgerEntryPermissions } from 'src/features/ledgerEntry/ledgerEntryPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.ledgerEntry.view.title,
  };
}

export default async function LedgerEntryViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(ledgerEntryPermissions.ledgerEntryRead, context)) {
    redirect('/');
  }

  return <LedgerEntryView id={params.id} context={context} />;
}
