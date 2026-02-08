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
import { DepositActions } from 'src/features/deposit/components/DepositActions';
import DepositListActions from 'src/features/deposit/components/DepositListActions';
import DepositListFilter from 'src/features/deposit/components/DepositListFilter';
import { depositFindManyApiCall } from 'src/features/deposit/depositApiCalls';
import {
  DepositWithRelationships,
  depositFilterInputSchema,
} from 'src/features/deposit/depositSchemas';
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
import { DepositNewButton } from 'src/features/deposit/components/DepositNewButton';
import { z } from 'zod';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { depositLabel } from 'src/features/deposit/depositLabel';
import { Deposit } from '@prisma/client';

const defaultData: Array<any> = [];

export default function DepositList({ context }: { context: AppContext }) {
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
      z.input<typeof depositFilterInputSchema>
    >(searchParams, depositFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<DepositWithRelationships>[] = [
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
        title: dictionary.deposit.fields.amount,
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
      accessorKey: 'status',
      meta: {
        title: dictionary.deposit.fields.status,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.deposit.enumerators.status,
          row.getValue('status'),
        );
      },
    },
    {
      accessorKey: 'chain',
      meta: {
        title: dictionary.deposit.fields.chain,
      },
    },
    {
      accessorKey: 'txHash',
      meta: {
        title: dictionary.deposit.fields.txHash,
      },
    },
    {
      accessorKey: 'fromAddress',
      meta: {
        title: dictionary.deposit.fields.fromAddress,
      },
    },
    {
      accessorKey: 'confirmations',
      meta: {
        title: dictionary.deposit.fields.confirmations,
      },
      header: dataTableHeader('right', dictionary),
      cell: ({ getValue }) => {
        return (
          <div className="whitespace-nowrap text-right">
            {getValue() as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'requiredConfirmations',
      meta: {
        title: dictionary.deposit.fields.requiredConfirmations,
      },
      header: dataTableHeader('right', dictionary),
      cell: ({ getValue }) => {
        return (
          <div className="whitespace-nowrap text-right">
            {getValue() as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'detectedAt',
      meta: {
        title: dictionary.deposit.fields.detectedAt,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDatetime(row.getValue('detectedAt'), dictionary)}
        </span>
      ),
    },
    {
      accessorKey: 'confirmedAt',
      meta: {
        title: dictionary.deposit.fields.confirmedAt,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDatetime(row.getValue('confirmedAt'), dictionary)}
        </span>
      ),
    },
    {
      accessorKey: 'creditedAt',
      meta: {
        title: dictionary.deposit.fields.creditedAt,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDatetime(row.getValue('creditedAt'), dictionary)}
        </span>
      ),
    },
    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true
      },
      cell: ({ row }) => (
        <DepositActions
          mode="table"
          deposit={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['deposit', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return depositFindManyApiCall(
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
    data: query.data?.deposits || defaultData,
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
        <Breadcrumb items={[[dictionary.deposit.list.menu]]} />
        <div className="flex gap-2">
          <DepositListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <DepositListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.deposit.list.noResults}
        newButton={<DepositNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
