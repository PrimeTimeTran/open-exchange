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
import { CandidateActions } from 'src/features/candidate/components/CandidateActions';
import CandidateListActions from 'src/features/candidate/components/CandidateListActions';
import CandidateListFilter from 'src/features/candidate/components/CandidateListFilter';
import { candidateFindManyApiCall } from 'src/features/candidate/candidateApiCalls';
import {
  CandidateWithRelationships,
  candidateFilterInputSchema,
} from 'src/features/candidate/candidateSchemas';
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
import { CandidateNewButton } from 'src/features/candidate/components/CandidateNewButton';
import { z } from 'zod';
import FileListItem from 'src/features/file/components/FileListItem';
import { FileUploaded } from 'src/features/file/fileSchemas';
import { candidateLabel } from 'src/features/candidate/candidateLabel';
import { Candidate } from '@prisma/client';

const defaultData: Array<any> = [];

export default function CandidateList({ context }: { context: AppContext }) {
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
      z.input<typeof candidateFilterInputSchema>
    >(searchParams, candidateFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<CandidateWithRelationships>[] = [
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
      accessorKey: 'firstName',
      meta: {
        title: dictionary.candidate.fields.firstName,
      },
    },
    {
      accessorKey: 'lastName',
      meta: {
        title: dictionary.candidate.fields.lastName,
      },
    },
    {
      accessorKey: 'preferredName',
      meta: {
        title: dictionary.candidate.fields.preferredName,
      },
    },
    {
      accessorKey: 'email',
      meta: {
        title: dictionary.candidate.fields.email,
      },
      cell: ({ getValue, row }) => (
        <span className="whitespace-nowrap">
          <Link
            className="text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400"
            href={`/candidate/${row?.original?.id}`}
            prefetch={false}
          >
            {candidateLabel(row?.original, context.dictionary)}
          </Link>
        </span>
      ),
    },
    {
      accessorKey: 'phone',
      meta: {
        title: dictionary.candidate.fields.phone,
      },
    },
    {
      accessorKey: 'country',
      meta: {
        title: dictionary.candidate.fields.country,
      },
    },
    {
      accessorKey: 'timezone',
      meta: {
        title: dictionary.candidate.fields.timezone,
      },
    },
    {
      accessorKey: 'linkedinUrl',
      meta: {
        title: dictionary.candidate.fields.linkedinUrl,
      },
    },
    {
      accessorKey: 'githubUrl',
      meta: {
        title: dictionary.candidate.fields.githubUrl,
      },
    },
    {
      accessorKey: 'portfolioUrl',
      meta: {
        title: dictionary.candidate.fields.portfolioUrl,
      },
    },
    {
      accessorKey: 'resumeUrl',
      meta: {
        title: dictionary.candidate.fields.resumeUrl,
      },
    },
    {
      accessorKey: 'resume',
      meta: {
        title: dictionary.candidate.fields.resume,
      },
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <span className="whitespace-nowrap">
            <FileListItem files={row.getValue('resume')} />
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
        <CandidateActions
          mode="table"
          candidate={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['candidate', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return candidateFindManyApiCall(
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
    data: query.data?.candidates || defaultData,
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
        <Breadcrumb items={[[dictionary.candidate.list.menu]]} />
        <div className="flex gap-2">
          <CandidateListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <CandidateListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.candidate.list.noResults}
        newButton={<CandidateNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
