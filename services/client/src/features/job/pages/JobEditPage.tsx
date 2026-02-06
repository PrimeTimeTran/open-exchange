import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import JobEdit from 'src/features/job/components/JobEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.job.edit.title,
  };
}

export default async function JobEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.jobUpdate, context)) {
    return redirect('/');
  }

  return <JobEdit context={context} id={params.id} />;
}
