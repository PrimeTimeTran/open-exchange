import { cookies } from 'next/headers';
import { PasswordChangeForm } from 'src/features/auth/components/PasswordChangeForm';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.auth.passwordChange.title,
  };
}

export default async function ProfilePage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb items={[[dictionary.auth.passwordChange.menu]]} />
      <div className="mt-1 text-sm text-muted-foreground">
        {dictionary.auth.passwordChange.subtitle}
      </div>
      <div className="mt-10">
        <PasswordChangeForm context={context} />
      </div>
    </div>
  );
}
