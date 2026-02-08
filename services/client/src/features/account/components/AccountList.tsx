'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Link from 'src/shared/components/Link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { AccountActions } from 'src/features/account/components/AccountActions';
import AccountListActions from 'src/features/account/components/AccountListActions';
import AccountListFilter from 'src/features/account/components/AccountListFilter';
import { accountFindManyApiCall } from 'src/features/account/accountApiCalls';
import {
  AccountWithRelationships,
  accountFilterInputSchema,
} from 'src/features/account/accountSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import DataTable from 'src/shared/components/dataTable/DataTable';
import { DataTableColumnIds } from 'src/shared/components/dataTable/DataTableColumnHeader';
import { DataTablePagination } from 'src/shared/components/dataTable/DataTablePagination';
import { DataTableQueryParams } from 'src/shared/components/dataTable/DataTableQueryParams';
import { dataTableHeader } from 'src/shared/components/dataTable/dataTableHeader';
import { dataTablePageCount } from 'src/shared/components/dataTable/dataTablePageCount';
import { dataTableSortToPrisma } from 'src/shared/components/dataTable/dataTableSortToPrisma';
import { Checkbox } from 'src/shared/components/ui/checkbox';
import { AppContext } from 'src/shared/controller/appContext';
import { AccountNewButton } from 'src/features/account/components/AccountNewButton';
import { z } from 'zod';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { accountLabel } from 'src/features/account/accountLabel';
import { Account } from '@prisma/client';

const defaultData: Array<any> = [];

export default function AccountList({ context }: { context: AppContext }) {
  const { dictionary } = context;
  const router = useRouter();
  const searchParams = useSearchParams();

  const sorting = useMemo(() => {
    return DataTableQueryParams.getSorting(searchParams);
  }, [searchParams]);

  const pagination = useMemo(() => {
    return DataTableQueryParams.getPagination(searchParams);
  }, [searchParams]);

  const filter = useMemo(() => {
    return DataTableQueryParams.getFilter<
      z.input<typeof accountFilterInputSchema>
    >(searchParams, accountFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<AccountWithRelationships>[] = [
    {
      id: DataTableColumnIds.select,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={dictionary.shared.dataTable.selectAll}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={dictionary.shared.dataTable.selectRow}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      meta: {
        title: dictionary.account.fields.name,
      },
    },
    {
      accessorKey: 'isSystem',
      meta: {
        title: dictionary.account.fields.isSystem,
      },
      cell: ({ row }) => {
        return row.getValue('isSystem')
          ? dictionary.shared.yes
          : dictionary.shared.no;
      },
    },
    {
      accessorKey: 'type',
      meta: {
        title: dictionary.account.fields.type,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.account.enumerators.type,
          row.getValue('type'),
        );
      },
    },
    {
      accessorKey: 'status',
      meta: {
        title: dictionary.account.fields.status,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.account.enumerators.status,
          row.getValue('status'),
        );
      },
    },
    {
      accessorKey: 'isInterest',
      meta: {
        title: dictionary.account.fields.isInterest,
      },
      cell: ({ row }) => {
        return row.getValue('isInterest')
          ? dictionary.shared.yes
          : dictionary.shared.no;
      },
    },
    {
      accessorKey: 'interestRate',
      meta: {
        title: dictionary.account.fields.interestRate,
      },
      header: dataTableHeader('right', dictionary),
      cell: ({ getValue }) => {
        return (
          <div className="whitespace-nowrap text-right">
            {formatDecimal(getValue() as string, context.locale)}
          </div>
        );
      },
    },
    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true
      },
      cell: ({ row }) => (
        <AccountActions
          mode="table"
          account={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['account', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return accountFindManyApiCall(
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
    data: query.data?.accounts || defaultData,
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
        <Breadcrumb items={[[dictionary.account.list.menu]]} />
        <div className="flex gap-2">
          <AccountListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <AccountListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.account.list.noResults}
        newButton={<AccountNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
