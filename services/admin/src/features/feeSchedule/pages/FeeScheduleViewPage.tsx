import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FeeScheduleView } from 'src/features/feeSchedule/components/FeeScheduleView';
import { feeSchedulePermissions } from 'src/features/feeSchedule/feeSchedulePermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.feeSchedule.view.title,
  };
}

export default async function FeeScheduleViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(feeSchedulePermissions.feeScheduleRead, context)) {
    redirect('/');
  }

  return <FeeScheduleView id={params.id} context={context} />;
}
