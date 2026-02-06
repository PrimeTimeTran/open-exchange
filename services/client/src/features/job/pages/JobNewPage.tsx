import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import JobNew from 'src/features/job/components/JobNew';
import { jobPermissions } from 'src/features/job/jobPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.job.new.title,
  };
}

export default async function JobNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(jobPermissions.jobCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.job.list.menu, '/job'],
          [dictionary.job.new.menu],
        ]}
      />
      <div className="my-10">
        <JobNew context={context} />
      </div>
    </div>
  );
}
