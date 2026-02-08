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
import { MarketMakerActions } from 'src/features/marketMaker/components/MarketMakerActions';
import MarketMakerListActions from 'src/features/marketMaker/components/MarketMakerListActions';
import MarketMakerListFilter from 'src/features/marketMaker/components/MarketMakerListFilter';
import { marketMakerFindManyApiCall } from 'src/features/marketMaker/marketMakerApiCalls';
import {
  MarketMakerWithRelationships,
  marketMakerFilterInputSchema,
} from 'src/features/marketMaker/marketMakerSchemas';
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
import { MarketMakerNewButton } from 'src/features/marketMaker/components/MarketMakerNewButton';
import { z } from 'zod';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { marketMakerLabel } from 'src/features/marketMaker/marketMakerLabel';
import { MarketMaker } from '@prisma/client';

const defaultData: Array<any> = [];

export default function MarketMakerList({ context }: { context: AppContext }) {
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
      z.input<typeof marketMakerFilterInputSchema>
    >(searchParams, marketMakerFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<MarketMakerWithRelationships>[] = [
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
      accessorKey: 'organizationName',
      meta: {
        title: dictionary.marketMaker.fields.organizationName,
      },
      cell: ({ getValue, row }) => (
        <span className="whitespace-nowrap">
          <Link
            className="text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400"
            href={`/market-maker/${row?.original?.id}`}
            prefetch={false}
          >
            {marketMakerLabel(row?.original, context.dictionary)}
          </Link>
        </span>
      ),
    },
    {
      accessorKey: 'contactEmail',
      meta: {
        title: dictionary.marketMaker.fields.contactEmail,
      },
    },
    {
      accessorKey: 'contactPhone',
      meta: {
        title: dictionary.marketMaker.fields.contactPhone,
      },
    },
    {
      accessorKey: 'status',
      meta: {
        title: dictionary.marketMaker.fields.status,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.marketMaker.enumerators.status,
          row.getValue('status'),
        );
      },
    },
    {
      accessorKey: 'tier',
      meta: {
        title: dictionary.marketMaker.fields.tier,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.marketMaker.enumerators.tier,
          row.getValue('tier'),
        );
      },
    },
    {
      accessorKey: 'marketsSupported',
      meta: {
        title: dictionary.marketMaker.fields.marketsSupported,
      },
    },
    {
      accessorKey: 'minQuoteSize',
      meta: {
        title: dictionary.marketMaker.fields.minQuoteSize,
      },
      header: dataTableHeader('right', dictionary),
      cell: ({ getValue }) => {
        return (
          <div className="whitespace-nowrap text-right">
            {getValue() as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'maxQuoteSize',
      meta: {
        title: dictionary.marketMaker.fields.maxQuoteSize,
      },
      header: dataTableHeader('right', dictionary),
      cell: ({ getValue }) => {
        return (
          <div className="whitespace-nowrap text-right">
            {getValue() as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'spreadLimit',
      meta: {
        title: dictionary.marketMaker.fields.spreadLimit,
      },
      header: dataTableHeader('right', dictionary),
      cell: ({ getValue }) => {
        return (
          <div className="whitespace-nowrap text-right">
            {getValue() as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'quoteObligation',
      meta: {
        title: dictionary.marketMaker.fields.quoteObligation,
      },
      cell: ({ row }) => {
        return row.getValue('quoteObligation')
          ? dictionary.shared.yes
          : dictionary.shared.no;
      },
    },
    {
      accessorKey: 'dailyVolumeTarget',
      meta: {
        title: dictionary.marketMaker.fields.dailyVolumeTarget,
      },
      header: dataTableHeader('right', dictionary),
      cell: ({ getValue }) => {
        return (
          <div className="whitespace-nowrap text-right">
            {getValue() as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'makerFee',
      meta: {
        title: dictionary.marketMaker.fields.makerFee,
      },
      header: dataTableHeader('right', dictionary),
      cell: ({ getValue }) => {
        return (
          <div className="whitespace-nowrap text-right">
            {getValue() as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'takerFee',
      meta: {
        title: dictionary.marketMaker.fields.takerFee,
      },
      header: dataTableHeader('right', dictionary),
      cell: ({ getValue }) => {
        return (
          <div className="whitespace-nowrap text-right">
            {getValue() as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'rebateRate',
      meta: {
        title: dictionary.marketMaker.fields.rebateRate,
      },
      header: dataTableHeader('right', dictionary),
      cell: ({ getValue }) => {
        return (
          <div className="whitespace-nowrap text-right">
            {getValue() as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'rebateBalance',
      meta: {
        title: dictionary.marketMaker.fields.rebateBalance,
      },
      header: dataTableHeader('right', dictionary),
      cell: ({ getValue }) => {
        return (
          <div className="whitespace-nowrap text-right">
            {getValue() as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'apiAccess',
      meta: {
        title: dictionary.marketMaker.fields.apiAccess,
      },
      cell: ({ row }) => {
        return row.getValue('apiAccess')
          ? dictionary.shared.yes
          : dictionary.shared.no;
      },
    },
    {
      accessorKey: 'maxOrdersPerSecond',
      meta: {
        title: dictionary.marketMaker.fields.maxOrdersPerSecond,
      },
      header: dataTableHeader('right', dictionary),
      cell: ({ getValue }) => {
        return (
          <div className="whitespace-nowrap text-right">
            {getValue() as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'directMarketAccess',
      meta: {
        title: dictionary.marketMaker.fields.directMarketAccess,
      },
      cell: ({ row }) => {
        return row.getValue('directMarketAccess')
          ? dictionary.shared.yes
          : dictionary.shared.no;
      },
    },
    {
      accessorKey: 'contractSignedAt',
      meta: {
        title: dictionary.marketMaker.fields.contractSignedAt,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDatetime(row.getValue('contractSignedAt'), dictionary)}
        </span>
      ),
    },
    {
      accessorKey: 'obligationViolationCount',
      meta: {
        title: dictionary.marketMaker.fields.obligationViolationCount,
      },
      header: dataTableHeader('right', dictionary),
      cell: ({ getValue }) => {
        return (
          <div className="whitespace-nowrap text-right">
            {getValue() as string}
          </div>
        );
      },
    },
    {
      accessorKey: 'notesInternal',
      meta: {
        title: dictionary.marketMaker.fields.notesInternal,
      },
    },
    {
      accessorKey: 'specialOrderTypes',
      meta: {
        title: dictionary.marketMaker.fields.specialOrderTypes,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.marketMaker.enumerators.specialOrderTypes,
          row.getValue('specialOrderTypes'),
        );
      },
    },
    {
      accessorKey: 'minFeeAmount',
      meta: {
        title: dictionary.marketMaker.fields.minFeeAmount,
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
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true
      },
      cell: ({ row }) => (
        <MarketMakerActions
          mode="table"
          marketMaker={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['marketMaker', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return marketMakerFindManyApiCall(
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
    data: query.data?.marketMakers || defaultData,
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
        <Breadcrumb items={[[dictionary.marketMaker.list.menu]]} />
        <div className="flex gap-2">
          <MarketMakerListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <MarketMakerListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.marketMaker.list.noResults}
        newButton={<MarketMakerNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
