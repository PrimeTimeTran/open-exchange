import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MessageNew from 'src/features/message/components/MessageNew';
import { messagePermissions } from 'src/features/message/messagePermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.message.new.title,
  };
}

export default async function MessageNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(messagePermissions.messageCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.message.list.menu, '/message'],
          [dictionary.message.new.menu],
        ]}
      />
      <div className="my-10">
        <MessageNew context={context} />
      </div>
    </div>
  );
}
