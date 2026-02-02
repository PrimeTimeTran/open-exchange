import { startCase, toLower } from 'lodash';
import { AuditLogWithAuthor } from 'src/features/auditLog/AuditLogWithAuthor';
import { labels } from 'src/features/labels';
import { membershipFullName } from 'src/features/membership/membershipFullName';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatTranslation } from 'src/translation/formatTranslation';
import { Dictionary } from 'src/translation/locales';

export const auditLogOperations = {
  signIn: 'SI',
  signOut: 'SO',
  signUp: 'SU',
  passwordResetRequest: 'PRR',
  passwordResetConfirm: 'PRC',
  passwordChange: 'PC',
  verifyEmailRequest: 'VER',
  verifyEmailConfirm: 'VEC',

  apiGet: 'AG',
  apiPost: 'APO',
  apiPut: 'APU',
  apiDelete: 'AD',

  create: 'C',
  update: 'U',
  delete: 'D',
} as const;

export function auditLogReadableOperation(
  auditLog: AuditLogWithAuthor,
  dictionary: Dictionary,
) {
  const unformattedText = enumeratorLabel(
    dictionary.auditLog.readableOperations,
    auditLog.operation,
  );

  if (!unformattedText) {
    return null;
  }

  const authorFullName = membershipFullName({
    firstName: auditLog.authorFirstName,
    lastName: auditLog.authorLastName,
  });

  const authorLabel = authorFullName || auditLog.authorEmail;

  const labelFunction = (labels as any)[auditLog.entityName] as (
    entity: any,
  ) => string;

  if (
    [auditLogOperations.update, auditLogOperations.delete].includes(
      auditLog?.operation,
    )
  ) {
    if (!labelFunction) {
      return null;
    }

    return formatTranslation(
      unformattedText,
      authorLabel,
      toLower(startCase(auditLog.entityName)),
      labelFunction(auditLog.oldData),
    ).trim();
  }

  if ([auditLogOperations.create].includes(auditLog?.operation)) {
    if (!labelFunction) {
      return null;
    }

    return formatTranslation(
      unformattedText,
      authorLabel,
      toLower(startCase(auditLog.entityName)),
      labelFunction(auditLog.newData),
    ).trim();
  }

  return formatTranslation(unformattedText, authorLabel).trim();
}
