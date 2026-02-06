import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ReferralNew from 'src/features/referral/components/ReferralNew';
import { referralPermissions } from 'src/features/referral/referralPermissions';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.referral.new.title,
  };
}

export default async function ReferralNewPage() {
  const context = await appContextForReact(cookies());
  const dictionary = context.dictionary;

  if (!hasPermission(referralPermissions.referralCreate, context)) {
    return redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.referral.list.menu, '/referral'],
          [dictionary.referral.new.menu],
        ]}
      />
      <div className="my-10">
        <ReferralNew context={context} />
      </div>
    </div>
  );
}
