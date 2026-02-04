import { AuditLogWithAuthor } from 'src/features/auditLog/AuditLogWithAuthor';
import { AuditLogApiHttpResponseCodeBadge } from 'src/features/auditLog/components/AuditLogApiHttpResponseCodeBadge';
import AuditLogChanges from 'src/features/auditLog/components/AuditLogChanges';
import { membershipFullName } from 'src/features/membership/membershipFullName';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDatetime } from 'src/shared/lib/formatDateTime';

export default function AuditLogViewDialog({
  auditLog,
  onClose,
  context,
}: {
  auditLog: AuditLogWithAuthor;
  onClose: () => void;
  context: AppContext;
}) {
  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-scroll sm:min-w-[640px]">
        <SheetHeader>
          <SheetTitle>
            {context.dictionary.auditLog.changesDialog.title}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-8 divide-y border-t">
          {Boolean(auditLog.timestamp) && (
            <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
              <div className="font-semibold">
                {context.dictionary.auditLog.fields.timestamp}
              </div>
              <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
                <span>
                  {formatDatetime(auditLog.timestamp, context.dictionary)}
                </span>
                <CopyToClipboardButton
                  text={formatDatetime(auditLog.timestamp, context.dictionary)}
                  dictionary={context.dictionary}
                />
              </div>
            </div>
          )}

          {Boolean(auditLog.transactionId) && (
            <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
              <div className="font-semibold">
                {context.dictionary.auditLog.fields.transactionId}
              </div>
              <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
                <span>{auditLog.transactionId?.toString()}</span>
                <CopyToClipboardButton
                  text={auditLog.transactionId?.toString()}
                  dictionary={context.dictionary}
                />
              </div>
            </div>
          )}

          {Boolean(auditLog.authorEmail) && (
            <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
              <div className="font-semibold">
                {context.dictionary.auditLog.fields.membership}
              </div>
              <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
                <span>
                  {auditLog.authorEmail}
                  {Boolean(auditLog.authorFirstName) && (
                    <span className="ml-2">
                      (
                      {membershipFullName({
                        firstName: auditLog.authorFirstName,
                        lastName: auditLog.authorLastName,
                      })}
                      )
                    </span>
                  )}
                </span>
                <CopyToClipboardButton
                  text={auditLog.authorEmail}
                  dictionary={context.dictionary}
                />
              </div>
            </div>
          )}

          {Boolean(auditLog.entityName) && (
            <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
              <div className="font-semibold">
                {context.dictionary.auditLog.fields.entityName}
              </div>
              <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
                <span>{auditLog.entityName}</span>
                <CopyToClipboardButton
                  text={auditLog.entityName}
                  dictionary={context.dictionary}
                />
              </div>
            </div>
          )}

          {Boolean(auditLog.operation) && (
            <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
              <div className="font-semibold">
                {context.dictionary.auditLog.fields.operation}
              </div>
              <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
                <span>
                  {enumeratorLabel(
                    context.dictionary.auditLog.enumerators.operation,
                    auditLog.operation,
                  )}
                </span>
                <CopyToClipboardButton
                  text={enumeratorLabel(
                    context.dictionary.auditLog.enumerators.operation,
                    auditLog.operation,
                  )}
                  dictionary={context.dictionary}
                />
              </div>
            </div>
          )}

          {Boolean(auditLog.entityId) && (
            <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
              <div className="font-semibold">
                {context.dictionary.auditLog.fields.entityId}
              </div>
              <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
                <span>{auditLog.entityId}</span>
                <CopyToClipboardButton
                  text={auditLog.entityId}
                  dictionary={context.dictionary}
                />
              </div>
            </div>
          )}

          {Boolean(auditLog.apiKey?.name) && (
            <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
              <div className="font-semibold">
                {context.dictionary.auditLog.fields.apiKey}
              </div>
              <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
                <span>{auditLog.apiKey?.name}</span>
                <CopyToClipboardButton
                  text={auditLog.apiKey?.name}
                  dictionary={context.dictionary}
                />
              </div>
            </div>
          )}

          {Boolean(auditLog.apiEndpoint) && (
            <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
              <div className="font-semibold">
                {context.dictionary.auditLog.fields.apiEndpoint}
              </div>
              <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
                <span>{auditLog.apiEndpoint}</span>
                <CopyToClipboardButton
                  text={auditLog.apiEndpoint}
                  dictionary={context.dictionary}
                />
              </div>
            </div>
          )}

          {Boolean(auditLog.apiHttpResponseCode) && (
            <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
              <div className="font-semibold">
                {context.dictionary.auditLog.fields.apiHttpResponseCode}
              </div>
              <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
                <AuditLogApiHttpResponseCodeBadge auditLog={auditLog} />
                <CopyToClipboardButton
                  text={auditLog.apiHttpResponseCode}
                  dictionary={context.dictionary}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 py-4">
            <div className="font-semibold">
              {context.dictionary.auditLog.changesDialog.changes}
            </div>
            <AuditLogChanges auditLog={auditLog} context={context} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
