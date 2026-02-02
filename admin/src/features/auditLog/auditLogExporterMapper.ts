import { AuditLogWithAuthor } from 'src/features/auditLog/AuditLogWithAuthor';
import { AppContext } from 'src/shared/controller/appContext';

export function auditLogExporterMapper(
  auditLogs: AuditLogWithAuthor[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return auditLogs.map((auditLog) => {
    return {
      timestamp: String(auditLog.timestamp),
      firstName: auditLog.authorFirstName,
      lastName: auditLog.authorLastName,
      email: auditLog.authorEmail,
    };
  });
}
