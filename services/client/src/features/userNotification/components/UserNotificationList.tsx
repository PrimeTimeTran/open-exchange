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
import { UserNotificationActions } from 'src/features/userNotification/components/UserNotificationActions';
import UserNotificationListActions from 'src/features/userNotification/components/UserNotificationListActions';
import UserNotificationListFilter from 'src/features/userNotification/components/UserNotificationListFilter';
import { userNotificationFindManyApiCall } from 'src/features/userNotification/userNotificationApiCalls';
import {
  UserNotificationWithRelationships,
  userNotificationFilterInputSchema,
} from 'src/features/userNotification/userNotificationSchemas';
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
import { UserNotificationNewButton } from 'src/features/userNotification/components/UserNotificationNewButton';
import { z } from 'zod';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { userNotificationLabel } from 'src/features/userNotification/userNotificationLabel';
import { UserNotification } from '@prisma/client';

const defaultData: Array<any> = [];

export default function UserNotificationList({ context }: { context: AppContext }) {
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
      z.input<typeof userNotificationFilterInputSchema>
    >(searchParams, userNotificationFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<UserNotificationWithRelationships>[] = [
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
      accessorKey: 'readAt',
      meta: {
        title: dictionary.userNotification.fields.readAt,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDatetime(row.getValue('readAt'), dictionary)}
        </span>
      ),
    },
    {
      accessorKey: 'dismissedAt',
      meta: {
        title: dictionary.userNotification.fields.dismissedAt,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDatetime(row.getValue('dismissedAt'), dictionary)}
        </span>
      ),
    },
    {
      accessorKey: 'acknowledgedAt',
      meta: {
        title: dictionary.userNotification.fields.acknowledgedAt,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDatetime(row.getValue('acknowledgedAt'), dictionary)}
        </span>
      ),
    },
    {
      accessorKey: 'deliveryChannel',
      meta: {
        title: dictionary.userNotification.fields.deliveryChannel,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.userNotification.enumerators.deliveryChannel,
          row.getValue('deliveryChannel'),
        );
      },
    },
    {
      accessorKey: 'deliveredAt',
      meta: {
        title: dictionary.userNotification.fields.deliveredAt,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDatetime(row.getValue('deliveredAt'), dictionary)}
        </span>
      ),
    },
    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true
      },
      cell: ({ row }) => (
        <UserNotificationActions
          mode="table"
          userNotification={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['userNotification', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return userNotificationFindManyApiCall(
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
    data: query.data?.userNotifications || defaultData,
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
        <Breadcrumb items={[[dictionary.userNotification.list.menu]]} />
        <div className="flex gap-2">
          <UserNotificationListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <UserNotificationListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.userNotification.list.noResults}
        newButton={<UserNotificationNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
