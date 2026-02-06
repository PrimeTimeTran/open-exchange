import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChatNew from 'src/features/chat/components/ChatNew';
import { chatPermissions } from 'src/features/chat/chatPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.chat.new.title,
  };
}

export default async function ChatNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(chatPermissions.chatCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.chat.list.menu, '/chat'],
          [dictionary.chat.new.menu],
        ]}
      />
      <div className="my-10">
        <ChatNew context={context} />
      </div>
    </div>
  );
}
