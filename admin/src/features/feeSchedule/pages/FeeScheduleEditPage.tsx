import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FeeScheduleEdit from 'src/features/feeSchedule/components/FeeScheduleEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.feeSchedule.edit.title,
  };
}

export default async function FeeScheduleEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.feeScheduleUpdate, context)) {
    return redirect('/');
  }

  return <FeeScheduleEdit context={context} id={params.id} />;
}
