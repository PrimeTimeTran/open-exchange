import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FeeScheduleNew from 'src/features/feeSchedule/components/FeeScheduleNew';
import { feeSchedulePermissions } from 'src/features/feeSchedule/feeSchedulePermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.feeSchedule.new.title,
  };
}

export default async function FeeScheduleNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(feeSchedulePermissions.feeScheduleCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.feeSchedule.list.menu, '/fee-schedule'],
          [dictionary.feeSchedule.new.menu],
        ]}
      />
      <div className="my-10">
        <FeeScheduleNew context={context} />
      </div>
    </div>
  );
}
