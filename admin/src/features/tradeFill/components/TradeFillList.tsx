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
import { TradeFillActions } from 'src/features/tradeFill/components/TradeFillActions';
import TradeFillListActions from 'src/features/tradeFill/components/TradeFillListActions';
import TradeFillListFilter from 'src/features/tradeFill/components/TradeFillListFilter';
import { tradeFillFindManyApiCall } from 'src/features/tradeFill/tradeFillApiCalls';
import {
  TradeFillWithRelationships,
  tradeFillFilterInputSchema,
} from 'src/features/tradeFill/tradeFillSchemas';
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
import { TradeFillNewButton } from 'src/features/tradeFill/components/TradeFillNewButton';
import { z } from 'zod';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { tradeFillLabel } from 'src/features/tradeFill/tradeFillLabel';
import { TradeFill } from '@prisma/client';

const defaultData: Array<any> = [];

export default function TradeFillList({ context }: { context: AppContext }) {
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
      z.input<typeof tradeFillFilterInputSchema>
    >(searchParams, tradeFillFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<TradeFillWithRelationships>[] = [
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
      accessorKey: 'side',
      meta: {
        title: dictionary.tradeFill.fields.side,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.tradeFill.enumerators.side,
          row.getValue('side'),
        );
      },
    },
    {
      accessorKey: 'price',
      meta: {
        title: dictionary.tradeFill.fields.price,
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
      accessorKey: 'quantity',
      meta: {
        title: dictionary.tradeFill.fields.quantity,
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
      accessorKey: 'fee',
      meta: {
        title: dictionary.tradeFill.fields.fee,
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
        <TradeFillActions
          mode="table"
          tradeFill={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['tradeFill', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return tradeFillFindManyApiCall(
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
    data: query.data?.tradeFills || defaultData,
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
        <Breadcrumb items={[[dictionary.tradeFill.list.menu]]} />
        <div className="flex gap-2">
          <TradeFillListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <TradeFillListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.tradeFill.list.noResults}
        newButton={<TradeFillNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
