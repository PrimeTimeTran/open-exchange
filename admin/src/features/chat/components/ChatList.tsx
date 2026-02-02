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
import { ChatActions } from 'src/features/chat/components/ChatActions';
import ChatListActions from 'src/features/chat/components/ChatListActions';
import ChatListFilter from 'src/features/chat/components/ChatListFilter';
import { chatFindManyApiCall } from 'src/features/chat/chatApiCalls';
import {
  ChatWithRelationships,
  chatFilterInputSchema,
} from 'src/features/chat/chatSchemas';
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
import { ChatNewButton } from 'src/features/chat/components/ChatNewButton';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from 'src/shared/components/ui/avatar';
import { FileUploaded } from 'src/features/file/fileSchemas';
import { chatLabel } from 'src/features/chat/chatLabel';
import { Chat } from '@prisma/client';

const defaultData: Array<any> = [];

export default function ChatList({ context }: { context: AppContext }) {
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
      z.input<typeof chatFilterInputSchema>
    >(searchParams, chatFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<ChatWithRelationships>[] = [
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
        title: dictionary.chat.fields.name,
      },
    },
    {
      accessorKey: 'media',
      meta: {
        title: dictionary.chat.fields.media,
      },
      enableSorting: false,
      cell: ({ row }) => {
        const media: FileUploaded[] = row.getValue('media');
        return (
          <Avatar>
            <AvatarImage src={media?.[0]?.downloadUrl} />
            <AvatarFallback></AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: 'active',
      meta: {
        title: dictionary.chat.fields.active,
      },
      cell: ({ row }) => {
        return row.getValue('active')
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
        <ChatActions
          mode="table"
          chat={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['chat', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return chatFindManyApiCall(
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
    data: query.data?.chats || defaultData,
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
        <Breadcrumb items={[[dictionary.chat.list.menu]]} />
        <div className="flex gap-2">
          <ChatListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <ChatListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.chat.list.noResults}
        newButton={<ChatNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
