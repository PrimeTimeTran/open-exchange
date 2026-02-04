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
import { FeedbackActions } from 'src/features/feedback/components/FeedbackActions';
import FeedbackListActions from 'src/features/feedback/components/FeedbackListActions';
import FeedbackListFilter from 'src/features/feedback/components/FeedbackListFilter';
import { feedbackFindManyApiCall } from 'src/features/feedback/feedbackApiCalls';
import {
  FeedbackWithRelationships,
  feedbackFilterInputSchema,
} from 'src/features/feedback/feedbackSchemas';
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
import { FeedbackNewButton } from 'src/features/feedback/components/FeedbackNewButton';
import { z } from 'zod';
import FileListItem from 'src/features/file/components/FileListItem';
import { FileUploaded } from 'src/features/file/fileSchemas';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { feedbackLabel } from 'src/features/feedback/feedbackLabel';
import { Feedback } from '@prisma/client';

const defaultData: Array<any> = [];

export default function FeedbackList({ context }: { context: AppContext }) {
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
      z.input<typeof feedbackFilterInputSchema>
    >(searchParams, feedbackFilterInputSchema);
  }, [searchParams]);

  const columns: ColumnDef<FeedbackWithRelationships>[] = [
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
        title: dictionary.feedback.fields.title,
      },
    },
    {
      accessorKey: 'description',
      meta: {
        title: dictionary.feedback.fields.description,
      },
    },
    {
      accessorKey: 'attachments',
      meta: {
        title: dictionary.feedback.fields.attachments,
      },
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <span className="whitespace-nowrap">
            <FileListItem files={row.getValue('attachments')} />
          </span>
        );
      },
    },
    {
      accessorKey: 'type',
      meta: {
        title: dictionary.feedback.fields.type,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.feedback.enumerators.type,
          row.getValue('type'),
        );
      },
    },
    {
      accessorKey: 'status',
      meta: {
        title: dictionary.feedback.fields.status,
      },
      cell: ({ row }) => {
        return enumeratorLabel(
          dictionary.feedback.enumerators.status,
          row.getValue('status'),
        );
      },
    },
    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true
      },
      cell: ({ row }) => (
        <FeedbackActions
          mode="table"
          feedback={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['feedback', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return feedbackFindManyApiCall(
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
    data: query.data?.feedbacks || defaultData,
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
        <Breadcrumb items={[[dictionary.feedback.list.menu]]} />
        <div className="flex gap-2">
          <FeedbackListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <FeedbackListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.feedback.list.noResults}
        newButton={<FeedbackNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
