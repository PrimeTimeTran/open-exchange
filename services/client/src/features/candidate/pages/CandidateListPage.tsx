import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CandidateList from 'src/features/candidate/components/CandidateList';
import { candidatePermissions } from 'src/features/candidate/candidatePermissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.candidate.list.title,
  };
}

export default async function CandidateListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(candidatePermissions.candidateRead, context)) {
    return redirect('/');
  }

  return <CandidateList context={context} />;
}
