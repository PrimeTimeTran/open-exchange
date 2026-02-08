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
import { ReferralActions } from 'src/features/referral/components/ReferralActions';
import ReferralListActions from 'src/features/referral/components/ReferralListActions';
import ReferralListFilter from 'src/features/referral/components/ReferralListFilter';
import { referralFindManyApiCall } from 'src/features/referral/referralApiCalls';
import {
  ReferralWithRelationships,
  referralFilterInputSchema,
} from 'src/features/referral/referralSchemas';
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
import { ReferralNewButton } from 'src/features/referral/components/ReferralNewButton';
import { z } from 'zod';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { referralLabel } from 'src/features/referral/referralLabel';
import { Referral } from '@prisma/client';

const defaultData: Array<any> = [];

export default function ReferralList({ context }: { context: AppContext }) {
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
      z.input<typeof referralFilterInputSchema>
    >(searchParams, referralFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<ReferralWithRelationships>[] = [
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
      accessorKey: 'referrerUserId',
      meta: {
        title: dictionary.referral.fields.referrerUserId,
      },
    },
    {
      accessorKey: 'referredUserId',
      meta: {
        title: dictionary.referral.fields.referredUserId,
      },
    },
    {
      accessorKey: 'referralCode',
      meta: {
        title: dictionary.referral.fields.referralCode,
      },
    },
    {
      accessorKey: 'source',
      meta: {
        title: dictionary.referral.fields.source,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.referral.enumerators.source,
          row.getValue('source'),
        );
      },
    },
    {
      accessorKey: 'status',
      meta: {
        title: dictionary.referral.fields.status,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.referral.enumerators.status,
          row.getValue('status'),
        );
      },
    },
    {
      accessorKey: 'rewardType',
      meta: {
        title: dictionary.referral.fields.rewardType,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.referral.enumerators.rewardType,
          row.getValue('rewardType'),
        );
      },
    },
    {
      accessorKey: 'rewardAmount',
      meta: {
        title: dictionary.referral.fields.rewardAmount,
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
      accessorKey: 'rewardCurrency',
      meta: {
        title: dictionary.referral.fields.rewardCurrency,
      },
    },
    {
      accessorKey: 'rewardedAt',
      meta: {
        title: dictionary.referral.fields.rewardedAt,
      },
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDatetime(row.getValue('rewardedAt'), dictionary)}
        </span>
      ),
    },
    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true
      },
      cell: ({ row }) => (
        <ReferralActions
          mode="table"
          referral={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['referral', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return referralFindManyApiCall(
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
    data: query.data?.referrals || defaultData,
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
        <Breadcrumb items={[[dictionary.referral.list.menu]]} />
        <div className="flex gap-2">
          <ReferralListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <ReferralListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.referral.list.noResults}
        newButton={<ReferralNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
