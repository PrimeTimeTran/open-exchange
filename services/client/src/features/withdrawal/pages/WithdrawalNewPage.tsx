import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import WithdrawalNew from 'src/features/withdrawal/components/WithdrawalNew';
import { withdrawalPermissions } from 'src/features/withdrawal/withdrawalPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.withdrawal.new.title,
  };
}

export default async function WithdrawalNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(withdrawalPermissions.withdrawalCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.withdrawal.list.menu, '/withdrawal'],
          [dictionary.withdrawal.new.menu],
        ]}
      />
      <div className="my-10">
        <WithdrawalNew context={context} />
      </div>
    </div>
  );
}
