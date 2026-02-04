import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MembershipNew } from 'src/features/membership/components/MembershipNew';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.membership.new.title,
  };
}

export default async function MembershipNewPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.membershipCreate, context)) {
    return redirect('/');
  }

  const dictionary = context.dictionary;

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.membership.list.menu, '/membership'],
          [dictionary.membership.new.menu],
        ]}
      />
      <div className="my-10">
        <MembershipNew context={context} />
      </div>
    </div>
  );
}
