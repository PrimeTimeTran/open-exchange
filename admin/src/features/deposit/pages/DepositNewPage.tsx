import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DepositNew from 'src/features/deposit/components/DepositNew';
import { depositPermissions } from 'src/features/deposit/depositPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.deposit.new.title,
  };
}

export default async function DepositNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(depositPermissions.depositCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.deposit.list.menu, '/deposit'],
          [dictionary.deposit.new.menu],
        ]}
      />
      <div className="my-10">
        <DepositNew context={context} />
      </div>
    </div>
  );
}
