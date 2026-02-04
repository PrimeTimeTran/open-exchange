import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FeedbackNew from 'src/features/feedback/components/FeedbackNew';
import { feedbackPermissions } from 'src/features/feedback/feedbackPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.feedback.new.title,
  };
}

export default async function FeedbackNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(feedbackPermissions.feedbackCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.feedback.list.menu, '/feedback'],
          [dictionary.feedback.new.menu],
        ]}
      />
      <div className="my-10">
        <FeedbackNew context={context} />
      </div>
    </div>
  );
}
