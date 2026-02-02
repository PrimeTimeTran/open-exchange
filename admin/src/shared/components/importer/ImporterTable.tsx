import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { isArray, truncate } from 'lodash';
import DataTable from 'src/shared/components/dataTable/DataTable';
import { DataTablePagination } from 'src/shared/components/dataTable/DataTablePagination';
import { dataTableHeader } from 'src/shared/components/dataTable/dataTableHeader';
import { ImporterRowStatus } from 'src/shared/components/importer/ImporterRowStatus';
import { AppContext } from 'src/shared/controller/appContext';

export function ImporterTable({
  context,
  keys,
  labels,
  rows,
}: {
  context: AppContext;
  keys: string[];
  labels: Record<string, string>;
  rows: any[];
}) {
  const dataColumns = keys.map((key) => {
    return {
      accessorKey: key,
      meta: {
        title: labels[key],
      },
    };
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: '_line',
      meta: {
        title: context.dictionary.shared.importer.line,
      },
    },
    {
      accessorKey: '_status',
      meta: {
        title: context.dictionary.shared.importer.status,
      },
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          <ImporterRowStatus
            _status={row.original._status}
            _errorMessages={row.original._errorMessages}
            dictionary={context.dictionary}
          />
        </div>
      ),
    },

    ...dataColumns,
  ];

  const table = useReactTable({
    data: rows,
    columns,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      header: dataTableHeader('left', context.dictionary),
      cell: ({ getValue }) => {
        const value = getValue();
        if (isArray(value)) {
          return (
            <span className="whitespace-nowrap">
              {value.map((item, index) => (
                <div title={String(item)} key={index}>
                  {truncate(item, { length: 40 })}
                </div>
              ))}
            </span>
          );
        }

        return (
          <span className="whitespace-nowrap" title={String(value)}>
            {truncate(value as string, { length: 40 })}
          </span>
        );
      },
    },
  });

  return (
    <>
      <DataTable
        table={table}
        columns={dataColumns}
        dictionary={context.dictionary}
      />
      <DataTablePagination table={table} />
    </>
  );
}
