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
import { NotificationActions } from 'src/features/notification/components/NotificationActions';
import NotificationListActions from 'src/features/notification/components/NotificationListActions';
import NotificationListFilter from 'src/features/notification/components/NotificationListFilter';
import { notificationFindManyApiCall } from 'src/features/notification/notificationApiCalls';
import {
  NotificationWithRelationships,
  notificationFilterInputSchema,
} from 'src/features/notification/notificationSchemas';
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
import { NotificationNewButton } from 'src/features/notification/components/NotificationNewButton';
import { z } from 'zod';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { notificationLabel } from 'src/features/notification/notificationLabel';
import { Notification } from '@prisma/client';

const defaultData: Array<any> = [];

export default function NotificationList({ context }: { context: AppContext }) {
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
      z.input<typeof notificationFilterInputSchema>
    >(searchParams, notificationFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<NotificationWithRelationships>[] = [
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
      accessorKey: 'type',
      meta: {
        title: dictionary.notification.fields.type,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.notification.enumerators.type,
          row.getValue('type'),
        );
      },
    },
    {
      accessorKey: 'severity',
      meta: {
        title: dictionary.notification.fields.severity,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.notification.enumerators.severity,
          row.getValue('severity'),
        );
      },
    },
    {
      accessorKey: 'title',
      meta: {
        title: dictionary.notification.fields.title,
      },
    },
    {
      accessorKey: 'body',
      meta: {
        title: dictionary.notification.fields.body,
      },
    },
    {
      accessorKey: 'actionUrl',
      meta: {
        title: dictionary.notification.fields.actionUrl,
      },
    },
    {
      accessorKey: 'scope',
      meta: {
        title: dictionary.notification.fields.scope,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.notification.enumerators.scope,
          row.getValue('scope'),
        );
      },
    },
    {
      accessorKey: 'targetUserId',
      meta: {
        title: dictionary.notification.fields.targetUserId,
      },
    },
    {
      accessorKey: 'targetSegment',
      meta: {
        title: dictionary.notification.fields.targetSegment,
      },
    },
    {
      accessorKey: 'persistent',
      meta: {
        title: dictionary.notification.fields.persistent,
      },
      cell: ({ row }) => {
        return row.getValue('persistent')
          ? dictionary.shared.yes
          : dictionary.shared.no;
      },
    },
    {
      accessorKey: 'dismissible',
      meta: {
        title: dictionary.notification.fields.dismissible,
      },
      cell: ({ row }) => {
        return row.getValue('dismissible')
          ? dictionary.shared.yes
          : dictionary.shared.no;
      },
    },
    {
      accessorKey: 'requiresAck',
      meta: {
        title: dictionary.notification.fields.requiresAck,
      },
      cell: ({ row }) => {
        return row.getValue('requiresAck')
          ? dictionary.shared.yes
          : dictionary.shared.no;
      },
    },
    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true
      },
      cell: ({ row }) => (
        <NotificationActions
          mode="table"
          notification={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['notification', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return notificationFindManyApiCall(
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
    data: query.data?.notifications || defaultData,
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
        <Breadcrumb items={[[dictionary.notification.list.menu]]} />
        <div className="flex gap-2">
          <NotificationListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <NotificationListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.notification.list.noResults}
        newButton={<NotificationNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
