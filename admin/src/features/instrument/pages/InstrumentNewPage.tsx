import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import InstrumentNew from 'src/features/instrument/components/InstrumentNew';
import { instrumentPermissions } from 'src/features/instrument/instrumentPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.instrument.new.title,
  };
}

export default async function InstrumentNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(instrumentPermissions.instrumentCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.instrument.list.menu, '/instrument'],
          [dictionary.instrument.new.menu],
        ]}
      />
      <div className="my-10">
        <InstrumentNew context={context} />
      </div>
    </div>
  );
}
