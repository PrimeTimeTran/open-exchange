'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { apiKeyFindManyApiCall } from 'src/features/apiKey/apiKeyApiCalls';
import { apiKeyPermissions } from 'src/features/apiKey/apiKeyPermissions';
import {
  ApiKeyWithMembership,
  apiKeyFilterInputSchema,
} from 'src/features/apiKey/apiKeySchemas';
import { ApiKeyActions } from 'src/features/apiKey/components/ApiKeyActions';
import ApiKeyListActions from 'src/features/apiKey/components/ApiKeyListActions';
import ApiKeyListFilter from 'src/features/apiKey/components/ApiKeyListFilter';
import { ApiKeyNewButton } from 'src/features/apiKey/components/ApiKeyNewButton';
import { ApiKeyScopesBadge } from 'src/features/apiKey/components/ApiKeyScopesBadge';
import { ApiKeyStatusBadge } from 'src/features/apiKey/components/ApiKeyStatusBadge';
import { membershipFullName } from 'src/features/membership/membershipFullName';
import { hasPermission } from 'src/features/security';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import DataTable from 'src/shared/components/dataTable/DataTable';
import { DataTableColumnIds } from 'src/shared/components/dataTable/DataTableColumnHeader';
import { DataTablePagination } from 'src/shared/components/dataTable/DataTablePagination';
import { DataTableQueryParams } from 'src/shared/components/dataTable/DataTableQueryParams';
import { DataTableViewOptions } from 'src/shared/components/dataTable/DataTableViewButton';
import { dataTableHeader } from 'src/shared/components/dataTable/dataTableHeader';
import { dataTablePageCount } from 'src/shared/components/dataTable/dataTablePageCount';
import { dataTableSortToPrisma } from 'src/shared/components/dataTable/dataTableSortToPrisma';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { z } from 'zod';

const defaultData: Array<any> = [];

export default function ApiKeyList({ context }: { context: AppContext }) {
  const { dictionary } = context;
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasPermissionToReadAllMembers = hasPermission(
    apiKeyPermissions.apiKeyReadAllMembers,
    context,
  );

  const sorting = useMemo(() => {
    return DataTableQueryParams.getSorting(searchParams);
  }, [searchParams]);

  const pagination = useMemo(() => {
    return DataTableQueryParams.getPagination(searchParams);
  }, [searchParams]);

  const filter = useMemo(() => {
    return DataTableQueryParams.getFilter<
      z.input<typeof apiKeyFilterInputSchema>
    >(searchParams, apiKeyFilterInputSchema);
  }, [searchParams]);

  let columns: ColumnDef<ApiKeyWithMembership>[] = [];

  if (hasPermissionToReadAllMembers) {
    columns.push({
      accessorKey: 'membership.user.email',
      meta: {
        title: dictionary.apiKey.fields.membership,
      },
      cell: ({ getValue, row }) => (
        <span className="whitespace-nowrap">
          {getValue() as string}
          {Boolean(row.original.membership?.user?.email) && (
            <span className="ml-2">
              ({membershipFullName(row.original.membership)})
            </span>
          )}
        </span>
      ),
    });
  }

  columns = [
    ...columns,
    {
      accessorKey: 'name',
      meta: {
        title: dictionary.apiKey.fields.name,
      },
    },
    {
      accessorKey: 'keyPrefix',
      meta: {
        title: dictionary.apiKey.fields.key,
      },
      header: dataTableHeader('right', dictionary),
      cell: ({ getValue }) => {
        return (
          <div className="whitespace-nowrap text-right">
            {getValue() as string}...
          </div>
        );
      },
    },
    {
      accessorKey: 'scopes',
      meta: {
        title: dictionary.apiKey.fields.scopes,
      },
      enableSorting: false,
      header: dataTableHeader('right', dictionary),
      cell: ({ row }) => {
        return (
          <div className="whitespace-nowrap text-right">
            <ApiKeyScopesBadge apiKey={row.original} />
          </div>
        );
      },
    },
    {
      accessorKey: 'expiresAt',
      meta: {
        title: dictionary.apiKey.fields.expiresAt,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDatetime(row.getValue('expiresAt'), dictionary)}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      meta: {
        title: dictionary.apiKey.fields.createdAt,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDatetime(row.getValue('createdAt'), dictionary)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      meta: {
        title: dictionary.apiKey.fields.status,
      },
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="whitespace-nowrap">
            <ApiKeyStatusBadge apiKey={row.original} context={context} />
          </div>
        );
      },
    },

    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true,
      },
      cell: ({ row }) => (
        <ApiKeyActions apiKey={row.original} context={context} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['apiKey', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return apiKeyFindManyApiCall(
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
    data: query.data?.apiKeys || defaultData,
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
    <div className="mb-4 flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <Breadcrumb items={[[dictionary.apiKey.list.menu]]} />
        <div className="flex gap-2">
          <DataTableViewOptions table={table} dictionary={context.dictionary} />
          <ApiKeyListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      {hasPermissionToReadAllMembers && (
        <ApiKeyListFilter context={context} isLoading={query.isLoading} />
      )}

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.apiKey.list.noResults}
        newButton={<ApiKeyNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
