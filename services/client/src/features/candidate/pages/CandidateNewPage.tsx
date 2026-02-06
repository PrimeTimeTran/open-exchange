import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CandidateNew from 'src/features/candidate/components/CandidateNew';
import { candidatePermissions } from 'src/features/candidate/candidatePermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.candidate.new.title,
  };
}

export default async function CandidateNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(candidatePermissions.candidateCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.candidate.list.menu, '/candidate'],
          [dictionary.candidate.new.menu],
        ]}
      />
      <div className="my-10">
        <CandidateNew context={context} />
      </div>
    </div>
  );
}
