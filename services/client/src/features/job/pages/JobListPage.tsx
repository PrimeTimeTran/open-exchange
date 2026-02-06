import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import JobList from 'src/features/job/components/JobList';
import { jobPermissions } from 'src/features/job/jobPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.job.list.title,
  };
}

export default async function JobListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(jobPermissions.jobRead, context)) {
    return redirect('/');
  }

  return <JobList context={context} />;
}
