import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChaterNew from 'src/features/chater/components/ChaterNew';
import { chaterPermissions } from 'src/features/chater/chaterPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.chater.new.title,
  };
}

export default async function ChaterNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(chaterPermissions.chaterCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.chater.list.menu, '/chater'],
          [dictionary.chater.new.menu],
        ]}
      />
      <div className="my-10">
        <ChaterNew context={context} />
      </div>
    </div>
  );
}
