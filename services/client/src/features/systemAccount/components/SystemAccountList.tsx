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
import { SystemAccountActions } from 'src/features/systemAccount/components/SystemAccountActions';
import SystemAccountListActions from 'src/features/systemAccount/components/SystemAccountListActions';
import SystemAccountListFilter from 'src/features/systemAccount/components/SystemAccountListFilter';
import { systemAccountFindManyApiCall } from 'src/features/systemAccount/systemAccountApiCalls';
import {
  SystemAccountWithRelationships,
  systemAccountFilterInputSchema,
} from 'src/features/systemAccount/systemAccountSchemas';
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
import { SystemAccountNewButton } from 'src/features/systemAccount/components/SystemAccountNewButton';
import { z } from 'zod';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { systemAccountLabel } from 'src/features/systemAccount/systemAccountLabel';
import { SystemAccount } from '@prisma/client';

const defaultData: Array<any> = [];

export default function SystemAccountList({ context }: { context: AppContext }) {
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
      z.input<typeof systemAccountFilterInputSchema>
    >(searchParams, systemAccountFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<SystemAccountWithRelationships>[] = [
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
        title: dictionary.systemAccount.fields.type,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.systemAccount.enumerators.type,
          row.getValue('type'),
        );
      },
    },
    {
      accessorKey: 'name',
      meta: {
        title: dictionary.systemAccount.fields.name,
      },
    },
    {
      accessorKey: 'description',
      meta: {
        title: dictionary.systemAccount.fields.description,
      },
    },
    {
      accessorKey: 'isActive',
      meta: {
        title: dictionary.systemAccount.fields.isActive,
      },
      cell: ({ row }) => {
        return row.getValue('isActive')
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
        <SystemAccountActions
          mode="table"
          systemAccount={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['systemAccount', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return systemAccountFindManyApiCall(
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
    data: query.data?.systemAccounts || defaultData,
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
        <Breadcrumb items={[[dictionary.systemAccount.list.menu]]} />
        <div className="flex gap-2">
          <SystemAccountListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <SystemAccountListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.systemAccount.list.noResults}
        newButton={<SystemAccountNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
