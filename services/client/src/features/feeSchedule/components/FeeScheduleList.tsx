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
import { FeeScheduleActions } from 'src/features/feeSchedule/components/FeeScheduleActions';
import FeeScheduleListActions from 'src/features/feeSchedule/components/FeeScheduleListActions';
import FeeScheduleListFilter from 'src/features/feeSchedule/components/FeeScheduleListFilter';
import { feeScheduleFindManyApiCall } from 'src/features/feeSchedule/feeScheduleApiCalls';
import {
  FeeScheduleWithRelationships,
  feeScheduleFilterInputSchema,
} from 'src/features/feeSchedule/feeScheduleSchemas';
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
import { FeeScheduleNewButton } from 'src/features/feeSchedule/components/FeeScheduleNewButton';
import { z } from 'zod';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { feeScheduleLabel } from 'src/features/feeSchedule/feeScheduleLabel';
import { FeeSchedule } from '@prisma/client';

const defaultData: Array<any> = [];

export default function FeeScheduleList({ context }: { context: AppContext }) {
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
      z.input<typeof feeScheduleFilterInputSchema>
    >(searchParams, feeScheduleFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<FeeScheduleWithRelationships>[] = [
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
      accessorKey: 'scope',
      meta: {
        title: dictionary.feeSchedule.fields.scope,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.feeSchedule.enumerators.scope,
          row.getValue('scope'),
        );
      },
    },
    {
      accessorKey: 'makerFeeBps',
      meta: {
        title: dictionary.feeSchedule.fields.makerFeeBps,
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
      accessorKey: 'takerFeeBps',
      meta: {
        title: dictionary.feeSchedule.fields.takerFeeBps,
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
      accessorKey: 'minFeeAmount',
      meta: {
        title: dictionary.feeSchedule.fields.minFeeAmount,
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
      accessorKey: 'effectiveFrom',
      meta: {
        title: dictionary.feeSchedule.fields.effectiveFrom,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDatetime(row.getValue('effectiveFrom'), dictionary)}
        </span>
      ),
    },
    {
      accessorKey: 'effectiveTo',
      meta: {
        title: dictionary.feeSchedule.fields.effectiveTo,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDatetime(row.getValue('effectiveTo'), dictionary)}
        </span>
      ),
    },
    {
      accessorKey: 'tier',
      meta: {
        title: dictionary.feeSchedule.fields.tier,
      },
    },
    {
      accessorKey: 'accountId',
      meta: {
        title: dictionary.feeSchedule.fields.accountId,
      },
    },
    {
      accessorKey: 'instrumentId',
      meta: {
        title: dictionary.feeSchedule.fields.instrumentId,
      },
    },
    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true
      },
      cell: ({ row }) => (
        <FeeScheduleActions
          mode="table"
          feeSchedule={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['feeSchedule', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return feeScheduleFindManyApiCall(
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
    data: query.data?.feeSchedules || defaultData,
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
        <Breadcrumb items={[[dictionary.feeSchedule.list.menu]]} />
        <div className="flex gap-2">
          <FeeScheduleListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <FeeScheduleListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.feeSchedule.list.noResults}
        newButton={<FeeScheduleNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
