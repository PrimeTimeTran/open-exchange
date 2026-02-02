import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChateeNew from 'src/features/chatee/components/ChateeNew';
import { chateePermissions } from 'src/features/chatee/chateePermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.chatee.new.title,
  };
}

export default async function ChateeNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(chateePermissions.chateeCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.chatee.list.menu, '/chatee'],
          [dictionary.chatee.new.menu],
        ]}
      />
      <div className="my-10">
        <ChateeNew context={context} />
      </div>
    </div>
  );
}
