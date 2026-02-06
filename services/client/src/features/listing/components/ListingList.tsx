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
import { ListingActions } from 'src/features/listing/components/ListingActions';
import ListingListActions from 'src/features/listing/components/ListingListActions';
import ListingListFilter from 'src/features/listing/components/ListingListFilter';
import { listingFindManyApiCall } from 'src/features/listing/listingApiCalls';
import {
  ListingWithRelationships,
  listingFilterInputSchema,
} from 'src/features/listing/listingSchemas';
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
import { ListingNewButton } from 'src/features/listing/components/ListingNewButton';
import { z } from 'zod';
import { formatDate } from 'src/shared/lib/formatDate';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { listingLabel } from 'src/features/listing/listingLabel';
import { Listing } from '@prisma/client';

const defaultData: Array<any> = [];

export default function ListingList({ context }: { context: AppContext }) {
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
      z.input<typeof listingFilterInputSchema>
    >(searchParams, listingFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<ListingWithRelationships>[] = [
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
      accessorKey: 'companyName',
      meta: {
        title: dictionary.listing.fields.companyName,
      },
    },
    {
      accessorKey: 'legalName',
      meta: {
        title: dictionary.listing.fields.legalName,
      },
    },
    {
      accessorKey: 'jurisdiction',
      meta: {
        title: dictionary.listing.fields.jurisdiction,
      },
    },
    {
      accessorKey: 'incorporationDate',
      meta: {
        title: dictionary.listing.fields.incorporationDate,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDate(row.getValue('incorporationDate'), dictionary)}
        </span>
      ),
    },
    {
      accessorKey: 'website',
      meta: {
        title: dictionary.listing.fields.website,
      },
    },
    {
      accessorKey: 'assetSymbol',
      meta: {
        title: dictionary.listing.fields.assetSymbol,
      },
      cell: ({ getValue, row }) => (
        <span className="whitespace-nowrap">
          <Link
            className="text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400"
            href={`/listing/${row?.original?.id}`}
            prefetch={false}
          >
            {listingLabel(row?.original, context.dictionary)}
          </Link>
        </span>
      ),
    },
    {
      accessorKey: 'assetClass',
      meta: {
        title: dictionary.listing.fields.assetClass,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.listing.enumerators.assetClass,
          row.getValue('assetClass'),
        );
      },
    },
    {
      accessorKey: 'status',
      meta: {
        title: dictionary.listing.fields.status,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.listing.enumerators.status,
          row.getValue('status'),
        );
      },
    },
    {
      accessorKey: 'submittedAt',
      meta: {
        title: dictionary.listing.fields.submittedAt,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDate(row.getValue('submittedAt'), dictionary)}
        </span>
      ),
    },
    {
      accessorKey: 'decisionAt',
      meta: {
        title: dictionary.listing.fields.decisionAt,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDate(row.getValue('decisionAt'), dictionary)}
        </span>
      ),
    },
    {
      accessorKey: 'kycCompleted',
      meta: {
        title: dictionary.listing.fields.kycCompleted,
      },
      cell: ({ row }) => {
        return row.getValue('kycCompleted')
          ? dictionary.shared.yes
          : dictionary.shared.no;
      },
    },
    {
      accessorKey: 'docsSubmitted',
      meta: {
        title: dictionary.listing.fields.docsSubmitted,
      },
      cell: ({ row }) => {
        return row.getValue('docsSubmitted')
          ? dictionary.shared.yes
          : dictionary.shared.no;
      },
    },
    {
      accessorKey: 'riskDisclosureUrl',
      meta: {
        title: dictionary.listing.fields.riskDisclosureUrl,
      },
    },
    {
      accessorKey: 'primaryContactName',
      meta: {
        title: dictionary.listing.fields.primaryContactName,
      },
    },
    {
      accessorKey: 'primaryContactEmail',
      meta: {
        title: dictionary.listing.fields.primaryContactEmail,
      },
    },
    {
      accessorKey: 'reviewedBy',
      meta: {
        title: dictionary.listing.fields.reviewedBy,
      },
    },
    {
      accessorKey: 'notes',
      meta: {
        title: dictionary.listing.fields.notes,
      },
    },
    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true
      },
      cell: ({ row }) => (
        <ListingActions
          mode="table"
          listing={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['listing', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return listingFindManyApiCall(
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
    data: query.data?.listings || defaultData,
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
        <Breadcrumb items={[[dictionary.listing.list.menu]]} />
        <div className="flex gap-2">
          <ListingListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <ListingListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.listing.list.noResults}
        newButton={<ListingNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
