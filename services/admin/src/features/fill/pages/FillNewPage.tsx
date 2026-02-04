import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FillNew from 'src/features/fill/components/FillNew';
import { fillPermissions } from 'src/features/fill/fillPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.fill.new.title,
  };
}

export default async function FillNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(fillPermissions.fillCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.fill.list.menu, '/fill'],
          [dictionary.fill.new.menu],
        ]}
      />
      <div className="my-10">
        <FillNew context={context} />
      </div>
    </div>
  );
}
