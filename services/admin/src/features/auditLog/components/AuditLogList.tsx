'use client';

import { ApiKey } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { LuSearch } from 'react-icons/lu';
import { apiKeyLabel } from 'src/features/apiKey/apiKeyLabel';
import { AuditLogWithAuthor } from 'src/features/auditLog/AuditLogWithAuthor';
import { auditLogFindManyApiCall } from 'src/features/auditLog/auditLogApiCalls';
import { auditLogFilterInputSchema } from 'src/features/auditLog/auditLogSchemas';
import { AuditLogApiHttpResponseCodeBadge } from 'src/features/auditLog/components/AuditLogApiHttpResponseCodeBadge';
import AuditLogListActions from 'src/features/auditLog/components/AuditLogListActions';
import { AuditLogListFilter } from 'src/features/auditLog/components/AuditLogListFilter';
import AuditLogViewDialog from 'src/features/auditLog/components/AuditLogViewDialog';
import { membershipFullName } from 'src/features/membership/membershipFullName';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import DataTable from 'src/shared/components/dataTable/DataTable';
import { DataTableColumnIds } from 'src/shared/components/dataTable/DataTableColumnHeader';
import { DataTablePagination } from 'src/shared/components/dataTable/DataTablePagination';
import { DataTableQueryParams } from 'src/shared/components/dataTable/DataTableQueryParams';
import { DataTableViewOptions } from 'src/shared/components/dataTable/DataTableViewButton';
import { dataTableHeader } from 'src/shared/components/dataTable/dataTableHeader';
import { dataTablePageCount } from 'src/shared/components/dataTable/dataTablePageCount';
import { dataTableSortToPrisma } from 'src/shared/components/dataTable/dataTableSortToPrisma';
import { Button } from 'src/shared/components/ui/button';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { z } from 'zod';

const defaultData: Array<any> = [];

export default function AuditLogList({ context }: { context: AppContext }) {
  const { dictionary } = context;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [auditLogToCompareChanges, setAuditLogToCompareChanges] =
    useState<AuditLogWithAuthor>();

  const sorting = useMemo(() => {
    return DataTableQueryParams.getSorting(searchParams);
  }, [searchParams]);

  const pagination = useMemo(() => {
    return DataTableQueryParams.getPagination(searchParams);
  }, [searchParams]);

  const filter = useMemo(() => {
    return DataTableQueryParams.getFilter<
      z.input<typeof auditLogFilterInputSchema>
    >(searchParams, auditLogFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<AuditLogWithAuthor>[] = [
    {
      accessorKey: 'timestamp',
      meta: {
        title: dictionary.auditLog.fields.timestamp,
      },
      cell: ({ getValue, row }) => (
        <span className="whitespace-nowrap">
          <button
            className="text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400"
            type="button"
            onClick={() => setAuditLogToCompareChanges(row.original)}
          >
            {formatDatetime(getValue() as string, context.dictionary)}
          </button>
        </span>
      ),
    },
    {
      accessorKey: 'transactionId',
      meta: {
        title: dictionary.auditLog.fields.transactionId,
      },
    },
    {
      accessorKey: 'authorEmail',
      meta: {
        title: dictionary.auditLog.fields.membership,
      },
      cell: ({ getValue, row }) => (
        <span className="whitespace-nowrap">
          {getValue() as string}
          {Boolean(row.original.authorFirstName) && (
            <span className="ml-2">
              (
              {membershipFullName({
                firstName: row.original.authorFirstName,
                lastName: row.original.authorLastName,
              })}
              )
            </span>
          )}
        </span>
      ),
    },
    {
      accessorKey: 'entityName',
      meta: {
        title: dictionary.auditLog.fields.entityName,
      },
      cell: ({ getValue, row }) => (
        <span className="whitespace-nowrap">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'operation',
      meta: {
        title: dictionary.auditLog.fields.operation,
      },
      cell: ({ getValue, row }) => (
        <span className="whitespace-nowrap">
          {enumeratorLabel(
            dictionary.auditLog.enumerators.operation,
            getValue() as string,
          )}
        </span>
      ),
    },
    {
      accessorKey: 'entityId',
      meta: {
        title: dictionary.auditLog.fields.entityId,
      },
    },
    {
      accessorKey: 'apiKey.name',
      meta: {
        title: dictionary.auditLog.fields.apiKey,
      },
      cell: ({ row }) => {
        if (row.original.apiKey == null && row.original.apiKeyId) {
          return `${row.original.apiKeyId} (${dictionary.shared.deleted})`;
        }

        return (
          <span className="whitespace-nowrap">
            {apiKeyLabel(row.original.apiKey as ApiKey, dictionary)}
          </span>
        );
      },
    },
    {
      accessorKey: 'apiEndpoint',
      meta: {
        title: dictionary.auditLog.fields.apiEndpoint,
      },
    },
    {
      accessorKey: 'apiHttpResponseCode',
      meta: {
        title: dictionary.auditLog.fields.apiHttpResponseCode,
      },
      cell: ({ getValue, row }) => (
        <span className="whitespace-nowrap">
          <AuditLogApiHttpResponseCodeBadge auditLog={row.original} />
        </span>
      ),
    },

    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true,
      },
      cell: ({ row }) => (
        <Button
          onClick={() => setAuditLogToCompareChanges(row.original)}
          variant="outline"
          size="sm"
          className="ml-auto flex h-8"
        >
          <LuSearch className="mr-2 h-4 w-4" />
          {dictionary.shared.view}
        </Button>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['auditLog', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return auditLogFindManyApiCall(
        {
          filter: filter,
          skip: pagination.pageIndex * pagination.pageSize,
          take: pagination.pageSize,
          orderBy: dataTableSortToPrisma(sorting),
        },
        signal,
      );
    },
  });

  const table = useReactTable({
    getRowId: ({ originalRow, index }) => originalRow?.id || index,
    data: query.data?.auditLogs || defaultData,
    columns,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      header: dataTableHeader('left', dictionary),
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap">{getValue() as string}</span>
      ),
    },
    state: {
      sorting,
      pagination,
    },
    onSortingChange: DataTableQueryParams.onSortingChange(
      sorting,
      router,
      searchParams,
    ),
    onPaginationChange: DataTableQueryParams.onPaginationChange(
      pagination,
      router,
      searchParams,
    ),
    manualSorting: true,
    manualPagination: true,
    pageCount: dataTablePageCount(query.data?.count, pagination),
    meta: {
      count: query.data?.count,
    },
  });

  return (
    <div className="mb-4 flex w-full flex-col gap-4 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <Breadcrumb items={[[dictionary.auditLog.list.menu]]} />
        <div className="flex gap-2">
          <DataTableViewOptions table={table} dictionary={context.dictionary} />
          <AuditLogListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <AuditLogListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.auditLog.list.noResults}
      />

      <DataTablePagination table={table} />

      {Boolean(auditLogToCompareChanges) && (
        <AuditLogViewDialog
          auditLog={auditLogToCompareChanges!}
          context={context}
          onClose={() => setAuditLogToCompareChanges(undefined)}
        />
      )}
    </div>
  );
}
