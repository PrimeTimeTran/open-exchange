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
import { OrderActions } from 'src/features/order/components/OrderActions';
import OrderListActions from 'src/features/order/components/OrderListActions';
import OrderListFilter from 'src/features/order/components/OrderListFilter';
import { orderFindManyApiCall } from 'src/features/order/orderApiCalls';
import {
  OrderWithRelationships,
  orderFilterInputSchema,
} from 'src/features/order/orderSchemas';
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
import { OrderNewButton } from 'src/features/order/components/OrderNewButton';
import { z } from 'zod';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { orderLabel } from 'src/features/order/orderLabel';
import { Order } from '@prisma/client';

const defaultData: Array<any> = [];

export default function OrderList({ context }: { context: AppContext }) {
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
      z.input<typeof orderFilterInputSchema>
    >(searchParams, orderFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<OrderWithRelationships>[] = [
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
        title: dictionary.order.fields.side,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.order.enumerators.side,
          row.getValue('side'),
        );
      },
    },
    {
      accessorKey: 'type',
      meta: {
        title: dictionary.order.fields.type,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.order.enumerators.type,
          row.getValue('type'),
        );
      },
    },
    {
      accessorKey: 'price',
      meta: {
        title: dictionary.order.fields.price,
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
        title: dictionary.order.fields.quantity,
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
      accessorKey: 'quantityFilled',
      meta: {
        title: dictionary.order.fields.quantityFilled,
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
        title: dictionary.order.fields.status,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.order.enumerators.status,
          row.getValue('status'),
        );
      },
    },
    {
      accessorKey: 'timeInFore',
      meta: {
        title: dictionary.order.fields.timeInFore,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.order.enumerators.timeInFore,
          row.getValue('timeInFore'),
        );
      },
    },

    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true
      },
      cell: ({ row }) => (
        <OrderActions
          mode="table"
          order={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['order', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return orderFindManyApiCall(
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
    data: query.data?.orders || defaultData,
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
        <Breadcrumb items={[[dictionary.order.list.menu]]} />
        <div className="flex gap-2">
          <OrderListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <OrderListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.order.list.noResults}
        newButton={<OrderNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
