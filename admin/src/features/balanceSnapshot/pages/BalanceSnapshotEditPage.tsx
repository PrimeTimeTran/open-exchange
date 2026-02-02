import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import BalanceSnapshotEdit from 'src/features/balanceSnapshot/components/BalanceSnapshotEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.balanceSnapshot.edit.title,
  };
}

export default async function BalanceSnapshotEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.balanceSnapshotUpdate, context)) {
    return redirect('/');
  }

  return <BalanceSnapshotEdit context={context} id={params.id} />;
}
