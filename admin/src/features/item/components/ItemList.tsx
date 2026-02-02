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
import { ItemActions } from 'src/features/item/components/ItemActions';
import ItemListActions from 'src/features/item/components/ItemListActions';
import ItemListFilter from 'src/features/item/components/ItemListFilter';
import { itemFindManyApiCall } from 'src/features/item/itemApiCalls';
import {
  ItemWithRelationships,
  itemFilterInputSchema,
} from 'src/features/item/itemSchemas';
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
import { ItemNewButton } from 'src/features/item/components/ItemNewButton';
import { z } from 'zod';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Avatar, AvatarFallback, AvatarImage } from 'src/shared/components/ui/avatar';
import { FileUploaded } from 'src/features/file/fileSchemas';
import FileListItem from 'src/features/file/components/FileListItem';
import { itemLabel } from 'src/features/item/itemLabel';
import { Item } from '@prisma/client';

const defaultData: Array<any> = [];

export default function ItemList({ context }: { context: AppContext }) {
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
      z.input<typeof itemFilterInputSchema>
    >(searchParams, itemFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<ItemWithRelationships>[] = [
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
        title: dictionary.item.fields.name,
      },
    },
    {
      accessorKey: 'caption',
      meta: {
        title: dictionary.item.fields.caption,
      },
    },
    {
      accessorKey: 'description',
      meta: {
        title: dictionary.item.fields.description,
      },
    },
    {
      accessorKey: 'price',
      meta: {
        title: dictionary.item.fields.price,
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
      accessorKey: 'photos',
      meta: {
        title: dictionary.item.fields.photos,
      },
      enableSorting: false,
      cell: ({ row }) => {
        const photos: FileUploaded[] = row.getValue('photos');
        return (
          <Avatar>
            <AvatarImage src={photos?.[0]?.downloadUrl} />
            <AvatarFallback></AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: 'category',
      meta: {
        title: dictionary.item.fields.category,
      },
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            {(row.getValue('category') as Array<string>).map((value, index) => {
              return <div key={index}>{value}</div>;
            })}
          </div>
        );
      },
    },
    {
      accessorKey: 'files',
      meta: {
        title: dictionary.item.fields.files,
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
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true
      },
      cell: ({ row }) => (
        <ItemActions
          mode="table"
          item={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['item', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return itemFindManyApiCall(
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
    data: query.data?.items || defaultData,
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
        <Breadcrumb items={[[dictionary.item.list.menu]]} />
        <div className="flex gap-2">
          <ItemListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <ItemListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.item.list.noResults}
        newButton={<ItemNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
