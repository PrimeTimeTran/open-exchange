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
import { PostActions } from 'src/features/post/components/PostActions';
import PostListActions from 'src/features/post/components/PostListActions';
import PostListFilter from 'src/features/post/components/PostListFilter';
import { postFindManyApiCall } from 'src/features/post/postApiCalls';
import {
  PostWithRelationships,
  postFilterInputSchema,
} from 'src/features/post/postSchemas';
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
import { PostNewButton } from 'src/features/post/components/PostNewButton';
import { z } from 'zod';
import FileListItem from 'src/features/file/components/FileListItem';
import { FileUploaded } from 'src/features/file/fileSchemas';
import { Avatar, AvatarFallback, AvatarImage } from 'src/shared/components/ui/avatar';
import { Membership } from '@prisma/client';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { postLabel } from 'src/features/post/postLabel';
import { Post } from '@prisma/client';

const defaultData: Array<any> = [];

export default function PostList({ context }: { context: AppContext }) {
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
      z.input<typeof postFilterInputSchema>
    >(searchParams, postFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<PostWithRelationships>[] = [
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
      accessorKey: 'title',
      meta: {
        title: dictionary.post.fields.title,
      },
    },
    {
      accessorKey: 'body',
      meta: {
        title: dictionary.post.fields.body,
      },
    },
    {
      accessorKey: 'files',
      meta: {
        title: dictionary.post.fields.files,
      },
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <span className="whitespace-nowrap">
            <FileListItem files={row.getValue('files')} />
          </span>
        );
      },
    },
    {
      accessorKey: 'images',
      meta: {
        title: dictionary.post.fields.images,
      },
      enableSorting: false,
      cell: ({ row }) => {
        const images: FileUploaded[] = row.getValue('images');
        return (
          <Avatar>
            <AvatarImage src={images?.[0]?.downloadUrl} />
            <AvatarFallback></AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: 'type',
      meta: {
        title: dictionary.post.fields.type,
      },
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            {(row.getValue('type') as Array<string>).map((value, index) => {
              return <div key={index}>{value}</div>;
            })}
          </div>
        );
      },
    },
    {
      accessorKey: 'user',
      meta: {
        title: dictionary.post.fields.user,
      },
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <MembershipLink
            membership={row.getValue('user')}
            context={context}
          />
        );
      },
    },
    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true
      },
      cell: ({ row }) => (
        <PostActions
          mode="table"
          post={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['post', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return postFindManyApiCall(
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
    data: query.data?.posts || defaultData,
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
        <Breadcrumb items={[[dictionary.post.list.menu]]} />
        <div className="flex gap-2">
          <PostListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <PostListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.post.list.noResults}
        newButton={<PostNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
