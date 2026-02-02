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
import { FillActions } from 'src/features/fill/components/FillActions';
import FillListActions from 'src/features/fill/components/FillListActions';
import FillListFilter from 'src/features/fill/components/FillListFilter';
import { fillFindManyApiCall } from 'src/features/fill/fillApiCalls';
import {
  FillWithRelationships,
  fillFilterInputSchema,
} from 'src/features/fill/fillSchemas';
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
import { FillNewButton } from 'src/features/fill/components/FillNewButton';
import { z } from 'zod';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { fillLabel } from 'src/features/fill/fillLabel';
import { Fill } from '@prisma/client';

const defaultData: Array<any> = [];

export default function FillList({ context }: { context: AppContext }) {
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
      z.input<typeof fillFilterInputSchema>
    >(searchParams, fillFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<FillWithRelationships>[] = [
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
        title: dictionary.fill.fields.side,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.fill.enumerators.side,
          row.getValue('side'),
        );
      },
    },
    {
      accessorKey: 'price',
      meta: {
        title: dictionary.fill.fields.price,
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
        title: dictionary.fill.fields.quantity,
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
        title: dictionary.fill.fields.fee,
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
        <FillActions
          mode="table"
          fill={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['fill', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return fillFindManyApiCall(
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
    data: query.data?.fills || defaultData,
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
        <Breadcrumb items={[[dictionary.fill.list.menu]]} />
        <div className="flex gap-2">
          <FillListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <FillListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.fill.list.noResults}
        newButton={<FillNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
