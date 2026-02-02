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
import { LedgerEventActions } from 'src/features/ledgerEvent/components/LedgerEventActions';
import LedgerEventListActions from 'src/features/ledgerEvent/components/LedgerEventListActions';
import LedgerEventListFilter from 'src/features/ledgerEvent/components/LedgerEventListFilter';
import { ledgerEventFindManyApiCall } from 'src/features/ledgerEvent/ledgerEventApiCalls';
import {
  LedgerEventWithRelationships,
  ledgerEventFilterInputSchema,
} from 'src/features/ledgerEvent/ledgerEventSchemas';
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
import { LedgerEventNewButton } from 'src/features/ledgerEvent/components/LedgerEventNewButton';
import { z } from 'zod';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { ledgerEventLabel } from 'src/features/ledgerEvent/ledgerEventLabel';
import { LedgerEvent } from '@prisma/client';

const defaultData: Array<any> = [];

export default function LedgerEventList({ context }: { context: AppContext }) {
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
      z.input<typeof ledgerEventFilterInputSchema>
    >(searchParams, ledgerEventFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<LedgerEventWithRelationships>[] = [
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
        title: dictionary.ledgerEvent.fields.type,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.ledgerEvent.enumerators.type,
          row.getValue('type'),
        );
      },
    },
    {
      accessorKey: 'referenceId',
      meta: {
        title: dictionary.ledgerEvent.fields.referenceId,
      },
    },
    {
      accessorKey: 'referenceType',
      meta: {
        title: dictionary.ledgerEvent.fields.referenceType,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.ledgerEvent.enumerators.referenceType,
          row.getValue('referenceType'),
        );
      },
    },
    {
      accessorKey: 'status',
      meta: {
        title: dictionary.ledgerEvent.fields.status,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.ledgerEvent.enumerators.status,
          row.getValue('status'),
        );
      },
    },
    {
      accessorKey: 'description',
      meta: {
        title: dictionary.ledgerEvent.fields.description,
      },
    },
    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true
      },
      cell: ({ row }) => (
        <LedgerEventActions
          mode="table"
          ledgerEvent={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['ledgerEvent', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return ledgerEventFindManyApiCall(
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
    data: query.data?.ledgerEvents || defaultData,
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
        <Breadcrumb items={[[dictionary.ledgerEvent.list.menu]]} />
        <div className="flex gap-2">
          <LedgerEventListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <LedgerEventListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.ledgerEvent.list.noResults}
        newButton={<LedgerEventNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
