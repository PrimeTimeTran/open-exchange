import { IMPORTER_STATUS } from 'src/shared/schemas/importerSchemas';
import { Dictionary } from 'src/translation/locales';

export function ImporterRowStatus({
  _status,
  _errorMessages,
  dictionary,
}: {
  _status: IMPORTER_STATUS;
  _errorMessages?: string[];
  dictionary: Dictionary;
}) {
  if (_status === 'pending') {
    return (
      <span className="rounded-lg bg-gray-500 px-2 py-1 text-sm font-medium text-white dark:bg-gray-800 dark:text-gray-100">
        {dictionary.shared.importer.pending}
      </span>
    );
  }

  if (_status === 'success') {
    return (
      <span className="rounded-lg bg-green-500 px-2 py-1 text-sm font-medium text-white dark:bg-green-800 dark:text-green-100">
        {dictionary.shared.importer.success}
      </span>
    );
  }

  if (_status === 'error') {
    return (
      <>
        <span className="rounded-lg bg-red-500 px-2 py-1 text-sm font-medium text-white dark:bg-red-800 dark:text-red-100">
          {dictionary.shared.importer.error}
        </span>{' '}
        <div
          style={{ wordWrap: 'break-word' }}
          className="mt-2 whitespace-nowrap text-red-400"
        >
          {_errorMessages?.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
      </>
    );
  }

  return null;
}
