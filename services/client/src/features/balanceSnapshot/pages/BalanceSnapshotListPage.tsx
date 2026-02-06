import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import BalanceSnapshotList from 'src/features/balanceSnapshot/components/BalanceSnapshotList';
import { balanceSnapshotPermissions } from 'src/features/balanceSnapshot/balanceSnapshotPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.balanceSnapshot.list.title,
  };
}

export default async function BalanceSnapshotListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(balanceSnapshotPermissions.balanceSnapshotRead, context)) {
    return redirect('/');
  }

  return <BalanceSnapshotList context={context} />;
}
