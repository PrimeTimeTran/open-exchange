import { cookies } from 'next/headers';
import { ProfileForm } from 'src/features/auth/components/ProfileForm';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.auth.profile.title,
  };
}

export default async function ProfilePage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb items={[[dictionary.auth.profile.menu]]} />
      <div className="mt-1 text-sm text-muted-foreground">
        {dictionary.auth.profile.subtitle}
      </div>
      <div className="mt-10">
        <ProfileForm context={context} />
      </div>
    </div>
  );
}
