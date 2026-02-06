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
import { LedgerEntryActions } from 'src/features/ledgerEntry/components/LedgerEntryActions';
import LedgerEntryListActions from 'src/features/ledgerEntry/components/LedgerEntryListActions';
import LedgerEntryListFilter from 'src/features/ledgerEntry/components/LedgerEntryListFilter';
import { ledgerEntryFindManyApiCall } from 'src/features/ledgerEntry/ledgerEntryApiCalls';
import {
  LedgerEntryWithRelationships,
  ledgerEntryFilterInputSchema,
} from 'src/features/ledgerEntry/ledgerEntrySchemas';
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
import { LedgerEntryNewButton } from 'src/features/ledgerEntry/components/LedgerEntryNewButton';
import { z } from 'zod';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { ledgerEntryLabel } from 'src/features/ledgerEntry/ledgerEntryLabel';
import { LedgerEntry } from '@prisma/client';

const defaultData: Array<any> = [];

export default function LedgerEntryList({ context }: { context: AppContext }) {
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
      z.input<typeof ledgerEntryFilterInputSchema>
    >(searchParams, ledgerEntryFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<LedgerEntryWithRelationships>[] = [
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
      accessorKey: 'amount',
      meta: {
        title: dictionary.ledgerEntry.fields.amount,
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
      accessorKey: 'accountId',
      meta: {
        title: dictionary.ledgerEntry.fields.accountId,
      },
    },
    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true
      },
      cell: ({ row }) => (
        <LedgerEntryActions
          mode="table"
          ledgerEntry={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['ledgerEntry', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return ledgerEntryFindManyApiCall(
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
    data: query.data?.ledgerEntries || defaultData,
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
        <Breadcrumb items={[[dictionary.ledgerEntry.list.menu]]} />
        <div className="flex gap-2">
          <LedgerEntryListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <LedgerEntryListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.ledgerEntry.list.noResults}
        newButton={<LedgerEntryNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
