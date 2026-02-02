import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LedgerEventEdit from 'src/features/ledgerEvent/components/LedgerEventEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.ledgerEvent.edit.title,
  };
}

export default async function LedgerEventEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.ledgerEventUpdate, context)) {
    return redirect('/');
  }

  return <LedgerEventEdit context={context} id={params.id} />;
}
