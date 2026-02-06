import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { JobView } from 'src/features/job/components/JobView';
import { jobPermissions } from 'src/features/job/jobPermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.job.view.title,
  };
}

export default async function JobViewPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(jobPermissions.jobRead, context)) {
    redirect('/');
  }

  return <JobView id={params.id} context={context} />;
}
