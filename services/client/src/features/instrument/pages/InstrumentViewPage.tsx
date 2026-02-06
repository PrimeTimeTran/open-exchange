import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { InstrumentView } from 'src/features/instrument/components/InstrumentView';
import { instrumentPermissions } from 'src/features/instrument/instrumentPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.instrument.view.title,
  };
}

export default async function InstrumentViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(instrumentPermissions.instrumentRead, context)) {
    redirect('/');
  }

  return <InstrumentView id={params.id} context={context} />;
}
