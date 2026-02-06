import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AccountNew from 'src/features/account/components/AccountNew';
import { accountPermissions } from 'src/features/account/accountPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.account.new.title,
  };
}

export default async function AccountNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(accountPermissions.accountCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.account.list.menu, '/account'],
          [dictionary.account.new.menu],
        ]}
      />
      <div className="my-10">
        <AccountNew context={context} />
      </div>
    </div>
  );
}
