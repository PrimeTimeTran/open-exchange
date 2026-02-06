import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CandidateEdit from 'src/features/candidate/components/CandidateEdit';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.candidate.edit.title,
  };
}

export default async function CandidateEditPage({
  params,
}: {
  params: { id: string };
}) {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.candidateUpdate, context)) {
    return redirect('/');
  }

  return <CandidateEdit context={context} id={params.id} />;
}
