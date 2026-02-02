import { cookies } from 'next/headers';
import SignOut from 'src/features/auth/components/SignOut';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.auth.signOut.title,
  };
}

export default async function SignOutPage() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return (
    <>
      <div className="container relative grid min-h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div
            className="absolute inset-0 bg-cover bg-right-top"
            style={{
              backgroundImage: 'url(/images/signOut.jpg)',
            }}
          />
        </div>
        <div className="w-[100vw] p-4 sm:w-auto lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center sm:w-[350px]">
            <div className="mb-2 flex flex-col text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {dictionary.projectName}
              </h1>
            </div>
            <SignOut dictionary={dictionary} />
          </div>
        </div>
      </div>
    </>
  );
}
