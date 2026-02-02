import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LedgerEventNew from 'src/features/ledgerEvent/components/LedgerEventNew';
import { ledgerEventPermissions } from 'src/features/ledgerEvent/ledgerEventPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.ledgerEvent.new.title,
  };
}

export default async function LedgerEventNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(ledgerEventPermissions.ledgerEventCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.ledgerEvent.list.menu, '/ledger-event'],
          [dictionary.ledgerEvent.new.menu],
        ]}
      />
      <div className="my-10">
        <LedgerEventNew context={context} />
      </div>
    </div>
  );
}
