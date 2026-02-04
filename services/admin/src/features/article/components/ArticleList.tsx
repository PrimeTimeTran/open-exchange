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
import { ArticleActions } from 'src/features/article/components/ArticleActions';
import ArticleListActions from 'src/features/article/components/ArticleListActions';
import ArticleListFilter from 'src/features/article/components/ArticleListFilter';
import { articleFindManyApiCall } from 'src/features/article/articleApiCalls';
import {
  ArticleWithRelationships,
  articleFilterInputSchema,
} from 'src/features/article/articleSchemas';
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
import { ArticleNewButton } from 'src/features/article/components/ArticleNewButton';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from 'src/shared/components/ui/avatar';
import { FileUploaded } from 'src/features/file/fileSchemas';
import FileListItem from 'src/features/file/components/FileListItem';
import { Membership } from '@prisma/client';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { articleLabel } from 'src/features/article/articleLabel';
import { Article } from '@prisma/client';

const defaultData: Array<any> = [];

export default function ArticleList({ context }: { context: AppContext }) {
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
      z.input<typeof articleFilterInputSchema>
    >(searchParams, articleFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<ArticleWithRelationships>[] = [
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
        title: dictionary.article.fields.title,
      },
    },
    {
      accessorKey: 'body',
      meta: {
        title: dictionary.article.fields.body,
      },
    },
    {
      accessorKey: 'type',
      meta: {
        title: dictionary.article.fields.type,
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
      accessorKey: 'images',
      meta: {
        title: dictionary.article.fields.images,
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
      accessorKey: 'files',
      meta: {
        title: dictionary.article.fields.files,
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
      accessorKey: 'user',
      meta: {
        title: dictionary.article.fields.user,
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
        <ArticleActions
          mode="table"
          article={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['article', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return articleFindManyApiCall(
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
    data: query.data?.articles || defaultData,
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
        <Breadcrumb items={[[dictionary.article.list.menu]]} />
        <div className="flex gap-2">
          <ArticleListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <ArticleListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.article.list.noResults}
        newButton={<ArticleNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
