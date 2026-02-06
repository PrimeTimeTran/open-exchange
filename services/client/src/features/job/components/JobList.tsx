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
import { JobActions } from 'src/features/job/components/JobActions';
import JobListActions from 'src/features/job/components/JobListActions';
import JobListFilter from 'src/features/job/components/JobListFilter';
import { jobFindManyApiCall } from 'src/features/job/jobApiCalls';
import {
  JobWithRelationships,
  jobFilterInputSchema,
} from 'src/features/job/jobSchemas';
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
import { JobNewButton } from 'src/features/job/components/JobNewButton';
import { z } from 'zod';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { jobLabel } from 'src/features/job/jobLabel';
import { Job } from '@prisma/client';

const defaultData: Array<any> = [];

export default function JobList({ context }: { context: AppContext }) {
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
      z.input<typeof jobFilterInputSchema>
    >(searchParams, jobFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<JobWithRelationships>[] = [
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
        title: dictionary.job.fields.title,
      },
    },
    {
      accessorKey: 'team',
      meta: {
        title: dictionary.job.fields.team,
      },
    },
    {
      accessorKey: 'location',
      meta: {
        title: dictionary.job.fields.location,
      },
    },
    {
      accessorKey: 'type',
      meta: {
        title: dictionary.job.fields.type,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.job.enumerators.type,
          row.getValue('type'),
        );
      },
    },
    {
      accessorKey: 'remote',
      meta: {
        title: dictionary.job.fields.remote,
      },
      cell: ({ row }) => {
        return row.getValue('remote')
          ? dictionary.shared.yes
          : dictionary.shared.no;
      },
    },
    {
      accessorKey: 'description',
      meta: {
        title: dictionary.job.fields.description,
      },
    },
    {
      accessorKey: 'requirements',
      meta: {
        title: dictionary.job.fields.requirements,
      },
    },
    {
      accessorKey: 'responsibilities',
      meta: {
        title: dictionary.job.fields.responsibilities,
      },
    },
    {
      accessorKey: 'quantity',
      meta: {
        title: dictionary.job.fields.quantity,
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
      accessorKey: 'salaryLow',
      meta: {
        title: dictionary.job.fields.salaryLow,
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
      accessorKey: 'salaryHigh',
      meta: {
        title: dictionary.job.fields.salaryHigh,
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
      accessorKey: 'status',
      meta: {
        title: dictionary.job.fields.status,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.job.enumerators.status,
          row.getValue('status'),
        );
      },
    },
    {
      accessorKey: 'seniority',
      meta: {
        title: dictionary.job.fields.seniority,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.job.enumerators.seniority,
          row.getValue('seniority'),
        );
      },
    },
    {
      accessorKey: 'currency',
      meta: {
        title: dictionary.job.fields.currency,
      },
    },
    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true
      },
      cell: ({ row }) => (
        <JobActions
          mode="table"
          job={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['job', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return jobFindManyApiCall(
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
    data: query.data?.jobs || defaultData,
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
        <Breadcrumb items={[[dictionary.job.list.menu]]} />
        <div className="flex gap-2">
          <JobListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <JobListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.job.list.noResults}
        newButton={<JobNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
