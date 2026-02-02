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
import { FileUploaded } from 'src/features/file/fileSchemas';
import { MembershipActions } from 'src/features/membership/components/MembershipActions';
import MembershipListActions from 'src/features/membership/components/MembershipListActions';
import MembershipListFilter from 'src/features/membership/components/MembershipListFilter';
import { MembershipNewButton } from 'src/features/membership/components/MembershipNewButton';
import { MembershipStatusBadge } from 'src/features/membership/components/MembershipStatusBadge';
import { membershipFindManyApiCall } from 'src/features/membership/membershipApiCalls';
import {
  MembershipWithUser,
  membershipFilterFormSchema,
} from 'src/features/membership/membershipSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import DataTable from 'src/shared/components/dataTable/DataTable';
import { DataTableColumnIds } from 'src/shared/components/dataTable/DataTableColumnHeader';
import { DataTablePagination } from 'src/shared/components/dataTable/DataTablePagination';
import { DataTableQueryParams } from 'src/shared/components/dataTable/DataTableQueryParams';
import { dataTableHeader } from 'src/shared/components/dataTable/dataTableHeader';
import { dataTablePageCount } from 'src/shared/components/dataTable/dataTablePageCount';
import { dataTableSortToPrisma } from 'src/shared/components/dataTable/dataTableSortToPrisma';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from 'src/shared/components/ui/avatar';
import { Checkbox } from 'src/shared/components/ui/checkbox';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { z } from 'zod';

const defaultData: Array<any> = [];

export default function MembershipList({ context }: { context: AppContext }) {
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
      z.input<typeof membershipFilterFormSchema>
    >(searchParams, membershipFilterFormSchema);
  }, [searchParams]);

  const columns: ColumnDef<MembershipWithUser>[] = [
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
      accessorKey: 'avatars',
      meta: {
        title: dictionary.membership.fields.avatars,
      },
      enableSorting: false,
      cell: ({ row }) => {
        const avatars: FileUploaded[] = row.getValue('avatars');
        return (
          <Avatar>
            <AvatarImage
              className="object-cover"
              src={avatars?.[0]?.downloadUrl}
            />
            <AvatarFallback></AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: 'user.email',
      meta: {
        title: dictionary.membership.fields.email,
      },
      cell: ({ getValue, row }) => (
        <span className="whitespace-nowrap">
          <Link
            className="text-blue-500 hover:text-blue-400 hover:underline focus:text-blue-400 dark:text-blue-400"
            href={`/membership/${row?.original?.id}`}
            prefetch={false}
          >
            {getValue() as string}
          </Link>
        </span>
      ),
    },
    {
      accessorKey: 'fullName',
      meta: {
        title: dictionary.membership.fields.fullName,
      },
    },
    {
      accessorKey: 'roles',
      meta: {
        title: dictionary.membership.fields.roles,
      },
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div>
            {(row.getValue('roles') as Array<string>).map((value) => {
              return (
                <div key={value}>
                  {enumeratorLabel(
                    dictionary.membership.enumerators.roles,
                    value,
                  )}
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      meta: {
        title: dictionary.membership.fields.status,
      },
      cell: ({ row }) => (
        <MembershipStatusBadge membership={row.original} context={context} />
      ),
    },
    {
      id: DataTableColumnIds.actions,
      meta: {
        sticky: true,
      },
      cell: ({ row }) => (
        <MembershipActions
          mode="table"
          membership={row.original}
          context={context}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const query = useQuery({
    queryKey: ['membership', 'list', filter, sorting, pagination],
    queryFn: async ({ signal }) => {
      return membershipFindManyApiCall(
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
    data: query.data?.memberships || defaultData,
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
        <Breadcrumb items={[[dictionary.membership.list.menu]]} />
        <div className="flex gap-2">
          <MembershipListActions
            filter={filter}
            sorting={sorting}
            count={query.data?.count}
            table={table}
            context={context}
          />
        </div>
      </div>

      <MembershipListFilter context={context} isLoading={query.isLoading} />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        columns={columns}
        dictionary={dictionary}
        notFoundText={dictionary.membership.list.noResults}
        newButton={<MembershipNewButton context={context} />}
      />

      <DataTablePagination table={table} />
    </div>
  );
}
