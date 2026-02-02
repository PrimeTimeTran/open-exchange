import { useQueryClient } from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { ImporterForm } from 'src/shared/components/importer/ImporterForm';
import { ImporterStatus } from 'src/shared/components/importer/ImporterStatus';
import { ImporterTable } from 'src/shared/components/importer/ImporterTable';
import { ImporterToolbar } from 'src/shared/components/importer/ImporterToolbar';
import { AppContext } from 'src/shared/controller/appContext';
import { importerOutputSchema } from 'src/shared/schemas/importerSchemas';
import { ZodSchema, z } from 'zod';

export function Importer({
  context,
  keys,
  labels,
  validationSchema,
  fileSchema,
  chunkSize = 50,
  importerFn,
  breadcrumbRoot,
  queryKeyToInvalidate,
}: {
  context: AppContext;
  keys: string[];
  labels: Record<string, string>;
  fileSchema: ZodSchema<any>;
  validationSchema: ZodSchema<any>;
  importerFn: (chunk: any[]) => Promise<z.infer<typeof importerOutputSchema>>;
  chunkSize?: number;
  breadcrumbRoot: [string, string];
  queryKeyToInvalidate?: Array<string>;
}) {
  const queryClient = useQueryClient();
  const { dictionary } = context;
  const [state, setState] = useState<
    'idle' | 'importing' | 'paused' | 'completed'
  >('idle');

  const _rows = useRef<any[]>([]);
  const [rows, setRows] = React.useState<z.infer<typeof importerOutputSchema>>(
    [],
  );

  function _setRows(rows: any[]) {
    _rows.current = rows;
    setRows(rows);
  }

  async function doStart() {
    setState('importing');

    while (_rows.current.some((row) => row._status === 'pending')) {
      if (state === 'paused') {
        break;
      }

      const chunk = _rows.current
        .filter((row) => row._status === 'pending')
        .slice(0, chunkSize);
      const result = await importerFn(chunk);

      _setRows(
        _rows.current.map((row) => {
          const match = result.find((r) => r._line === row._line);
          if (match) {
            return { ...row, ...match };
          }
          return row;
        }),
      );

      if (queryKeyToInvalidate) {
        queryClient.invalidateQueries({
          queryKey: queryKeyToInvalidate,
        });
      }
    }

    const isCompleted = !_rows.current.some((row) => row._status === 'pending');
    if (isCompleted) {
      setState('completed');
    }
  }

  function doNew() {
    _setRows([]);
    setState('idle');
  }

  function doPause() {
    setState('paused');
  }

  return (
    <div className="mb-4 flex w-full flex-col gap-4 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[breadcrumbRoot, [dictionary.shared.importer.menu]]}
        />
        <div className="flex gap-2"></div>
      </div>

      {rows.length ? (
        <div className="mb-4 flex flex-col gap-4">
          <ImporterToolbar
            state={state}
            doNew={doNew}
            doPause={doPause}
            doStart={doStart}
            dictionary={dictionary}
            rows={rows}
          />
          <ImporterStatus dictionary={dictionary} state={state} rows={rows} />
          <ImporterTable
            context={context}
            keys={keys}
            labels={labels}
            rows={rows}
          />
        </div>
      ) : (
        <ImporterForm
          context={context}
          validationSchema={validationSchema}
          fileSchema={fileSchema}
          keys={keys}
          labels={labels}
          setRows={_setRows}
        />
      )}
    </div>
  );
}
