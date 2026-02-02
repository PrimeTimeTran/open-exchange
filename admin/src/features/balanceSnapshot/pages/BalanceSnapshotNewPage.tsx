import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import BalanceSnapshotNew from 'src/features/balanceSnapshot/components/BalanceSnapshotNew';
import { balanceSnapshotPermissions } from 'src/features/balanceSnapshot/balanceSnapshotPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.balanceSnapshot.new.title,
  };
}

export default async function BalanceSnapshotNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(balanceSnapshotPermissions.balanceSnapshotCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.balanceSnapshot.list.menu, '/balance-snapshot'],
          [dictionary.balanceSnapshot.new.menu],
        ]}
      />
      <div className="my-10">
        <BalanceSnapshotNew context={context} />
      </div>
    </div>
  );
}
