import React from 'react';
import { IMPORTER_STATUS } from 'src/shared/schemas/importerSchemas';
import { formatTranslation } from 'src/translation/formatTranslation';
import { Dictionary } from 'src/translation/locales';

export function ImporterStatus({
  rows,
  state,
  dictionary,
}: {
  state: 'idle' | 'importing' | 'paused' | 'completed';
  rows: { _status: IMPORTER_STATUS }[];
  dictionary: Dictionary;
}) {
  const allCount = rows.length;
  const pendingCount = rows.filter((row) => row._status === 'pending')?.length;
  const nonPendingCount = rows.filter((row) => row._status !== 'pending')
    ?.length;
  const percent = Math.round(((allCount - pendingCount) / allCount) * 100);
  const isAllErrors = rows.every((row) => row._status === 'error');
  const isSomeErrors = rows.some((row) => row._status === 'error');
  const isAllSuccess = rows.every((row) => row._status === 'success');

  if (state === 'importing') {
    return (
      <div className="flex flex-col">
        <div className="w-full rounded-t-md bg-gray-500 px-5 py-3 text-sm font-medium text-white dark:bg-gray-800 dark:text-gray-100">
          {formatTranslation(
            dictionary.shared.importer.importedMessage,
            nonPendingCount,
            allCount,
          )}{' '}
          {dictionary.shared.importer.noNavigateAwayMessage}
        </div>
        <div className="relative">
          <div className="flex h-2 overflow-hidden rounded-b-md bg-blue-200 text-xs">
            <div
              className="flex flex-col justify-center whitespace-nowrap bg-blue-500 text-center text-white shadow-none"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'completed' && isAllSuccess) {
    return (
      <div className="w-full rounded-md bg-green-500 px-5 py-3 text-sm font-medium text-white dark:bg-green-800 dark:text-green-100">
        {formatTranslation(dictionary.shared.importer.completed.success)}
      </div>
    );
  }

  if (state === 'completed' && isAllErrors) {
    return (
      <div className="w-full rounded-md bg-red-500 px-5 py-3 text-sm font-medium text-white dark:bg-red-800 dark:text-red-100">
        {formatTranslation(dictionary.shared.importer.completed.allErrors)}
      </div>
    );
  }

  if (state === 'completed' && isSomeErrors) {
    return (
      <div className="w-full rounded-md bg-yellow-500 px-5 py-3 text-sm font-medium text-white dark:bg-yellow-800 dark:text-yellow-100">
        {formatTranslation(dictionary.shared.importer.completed.someErrors)}
      </div>
    );
  }

  return null;
}
