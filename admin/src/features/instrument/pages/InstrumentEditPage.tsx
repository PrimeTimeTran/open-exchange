import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import InstrumentEdit from 'src/features/instrument/components/InstrumentEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.instrument.edit.title,
  };
}

export default async function InstrumentEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.instrumentUpdate, context)) {
    return redirect('/');
  }

  return <InstrumentEdit context={context} id={params.id} />;
}
