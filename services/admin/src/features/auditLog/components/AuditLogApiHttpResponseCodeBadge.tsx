import { AuditLogWithAuthor } from 'src/features/auditLog/AuditLogWithAuthor';
import { Badge } from 'src/shared/components/ui/badge';

export function AuditLogApiHttpResponseCodeBadge({
  auditLog,
}: {
  auditLog: AuditLogWithAuthor;
}) {
  const apiHttpResponseCode = auditLog.apiHttpResponseCode;

  if (!apiHttpResponseCode) {
    return null;
  }

  if (
    Number(apiHttpResponseCode) <= 200 &&
    Number(apiHttpResponseCode) >= 299
  ) {
    return (
      <Badge className="bg-green-500 hover:bg-green-500/80 dark:bg-green-900 dark:text-green-100">
        {apiHttpResponseCode}
      </Badge>
    );
  }

  return <Badge variant={'destructive'}>{apiHttpResponseCode}</Badge>;
}
