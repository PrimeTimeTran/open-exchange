import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FeeScheduleList from 'src/features/feeSchedule/components/FeeScheduleList';
import { feeSchedulePermissions } from 'src/features/feeSchedule/feeSchedulePermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.feeSchedule.list.title,
  };
}

export default async function FeeScheduleListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(feeSchedulePermissions.feeScheduleRead, context)) {
    return redirect('/');
  }

  return <FeeScheduleList context={context} />;
}
