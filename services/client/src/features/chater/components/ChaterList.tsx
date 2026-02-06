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
import { ChaterActions } from 'src/features/chater/components/ChaterActions';
import ChaterListActions from 'src/features/chater/components/ChaterListActions';
import ChaterListFilter from 'src/features/chater/components/ChaterListFilter';
import { chaterFindManyApiCall } from 'src/features/chater/chaterApiCalls';
import {
  ChaterWithRelationships,
  chaterFilterInputSchema,
} from 'src/features/chater/chaterSchemas';
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
import { ChaterNewButton } from 'src/features/chater/components/ChaterNewButton';
import { z } from 'zod';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { chaterLabel } from 'src/features/chater/chaterLabel';
import { Chater } from '@prisma/client';

const defaultData: Array<any> = [];

export default function ChaterList({ context }: { context: AppContext }) {
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
      z.input<typeof chaterFilterInputSchema>
    >(searchParams, chaterFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<ChaterWithRelationships>[] = [
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
      accessorKey: 'nickname',
      meta: {
        title: dictionary.chater.fields.nickname,
      },
    },
    {
      accessorKey: 'status',
      meta: {
        title: dictionary.chater.fields.status,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.chater.enumerators.status,
          row.getValue('status'),
        );
      },
    },
    {
      accessorKey: 'role',
      meta: {
        title: dictionary.chater.fields.role,
      },
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            {(row.getValue('role') as Array<string>).map((value, index) => {
              return <div key={index}>{value}</div>;
            })}
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
        <ChaterActions
          mode="table"
          chater={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['chater', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return chaterFindManyApiCall(
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
    data: query.data?.chaters || defaultData,
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
        <Breadcrumb items={[[dictionary.chater.list.menu]]} />
        <div className="flex gap-2">
          <ChaterListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <ChaterListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.chater.list.noResults}
        newButton={<ChaterNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
