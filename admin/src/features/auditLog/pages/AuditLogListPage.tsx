import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuditLogList from 'src/features/auditLog/components/AuditLogList';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { appContextForReact } from 'src/shared/controller/appContext';
import { getDictionary } from 'src/translation/getDictionary';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';

export async function generateMetadata() {
  const locale = getLocaleFromCookies(cookies());
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.auditLog.list.title,
  };
}

export default async function AuditLogListPage() {
  const context = await appContextForReact(cookies());

  if (!hasPermission(permissions.auditLogRead, context)) {
    return redirect('/');
  }

  return <AuditLogList context={context} />;
}
