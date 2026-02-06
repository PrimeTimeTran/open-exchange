import ReactDiffViewer from 'react-diff-viewer-continued';
import { AuditLogWithAuthor } from 'src/features/auditLog/AuditLogWithAuthor';
import { auditLogFindChanges } from 'src/features/auditLog/auditLogFindChanges';
import { AppContext } from 'src/shared/controller/appContext';

export default function AuditLogChanges({
  auditLog,
  context,
}: {
  auditLog: AuditLogWithAuthor;
  context: AppContext;
}) {
  const { oldData, newData } = auditLogFindChanges(auditLog);

  if (!Object.keys(newData).length && !Object.keys(oldData).length) {
    return (
      <p className="font-medium text-muted-foreground">
        {context.dictionary.auditLog.changesDialog.noChanges}
      </p>
    );
  }

  const sideWithData = Object.keys(newData).length > 0 ? 'new' : 'old';

  return (
    <div>
      {Object.keys(sideWithData === 'new' ? newData : oldData).map((key) => {
        return (
          <div className="mb-4">
            <div className="mb-2 text-lg font-medium text-muted-foreground">
              {key}
            </div>
            <ReactDiffViewer
              oldValue={JSON.stringify(oldData[key], null, 2)}
              newValue={JSON.stringify(newData[key], null, 2)}
              splitView={
                Boolean(Object.keys(oldData).length) &&
                Boolean(Object.keys(newData).length)
              }
            />
          </div>
        );
      })}
    </div>
  );
}
