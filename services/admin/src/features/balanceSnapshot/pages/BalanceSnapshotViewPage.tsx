import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { BalanceSnapshotView } from 'src/features/balanceSnapshot/components/BalanceSnapshotView';
import { balanceSnapshotPermissions } from 'src/features/balanceSnapshot/balanceSnapshotPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.balanceSnapshot.view.title,
  };
}

export default async function BalanceSnapshotViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(balanceSnapshotPermissions.balanceSnapshotRead, context)) {
    redirect('/');
  }

  return <BalanceSnapshotView id={params.id} context={context} />;
}
