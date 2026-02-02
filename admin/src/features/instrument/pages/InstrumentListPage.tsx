import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import InstrumentList from 'src/features/instrument/components/InstrumentList';
import { instrumentPermissions } from 'src/features/instrument/instrumentPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.instrument.list.title,
  };
}

export default async function InstrumentListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(instrumentPermissions.instrumentRead, context)) {
    return redirect('/');
  }

  return <InstrumentList context={context} />;
}
