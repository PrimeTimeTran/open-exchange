'use client';

import { Referral } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Table } from '@tanstack/react-table';
import Link from 'next/link';
import { useState } from 'react';
import {
  FaPlus,
  FaRegFileExcel,
  FaTrashAlt,
  FaUndo,
  FaArchive,
} from 'react-icons/fa';
import { LuLoader2 } from 'react-icons/lu';
import { MdUpload } from 'react-icons/md';
import { RxDotsHorizontal } from 'react-icons/rx';
import {
  referralDestroyManyApiCall,
  referralFindManyApiCall,
  referralArchiveManyApiCall,
  referralRestoreManyApiCall,
} from 'src/features/referral/referralApiCalls';
import { referralExporterMapper } from 'src/features/referral/referralExporterMapper';
import { referralFilterInputSchema } from 'src/features/referral/referralSchemas';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { ConfirmDialog } from 'src/shared/components/ConfirmDialog';
import { DataTableViewOptions } from 'src/shared/components/dataTable/DataTableViewButton';
import { DataTableSort } from 'src/shared/components/dataTable/dataTableSchemas';
import { dataTableSortToPrisma } from 'src/shared/components/dataTable/dataTableSortToPrisma';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { csvExporter } from 'src/shared/lib/csvExporter';
import { formatTranslation } from 'src/translation/formatTranslation';
import { z } from 'zod';

export default function ReferralListActions({
  context,
  table,
  count,
  filter,
  sorting,
}: {
  filter: z.input<typeof referralFilterInputSchema>;
  sorting: DataTableSort;
  count?: number;
  context: AppContext;
  table: Table<Referral>;
}) {
  const { dictionary } = context;
  const queryClient = useQueryClient();

  const [destroyManyDialogOpen, setDestroyManyDialogOpen] = useState(false);
  const [restoreManyDialogOpen, setRestoreManyDialogOpen] = useState(false);
  const [archiveManyDialogOpen, setArchiveManyDialogOpen] = useState(false);

  const hasPermissionToCreate = hasPermission(
    permissions.referralCreate,
    context,
  );

  const hasPermissionToDestroy = hasPermission(
    permissions.referralDestroy,
    context,
  );

  const hasPermissionToArchive = hasPermission(
    permissions.referralArchive,
    context,
  );

  const hasPermissionToRestore = hasPermission(
    permissions.referralRestore,
    context,
  );

  const hasPermissionToImport = hasPermission(
    permissions.referralImport,
    context,
  );

  const exportMutation = useMutation({
    mutationFn: () => {
      return referralFindManyApiCall({
        filter: filter,
        orderBy: dataTableSortToPrisma(sorting),
      });
    },
    onSuccess: (data) => {
      csvExporter(
        referralExporterMapper(data.referrals, context),
        dictionary.referral.fields,
        'referrals',
      );
      toast({
        description: dictionary.referral.export.success,
      });
    },
    onError: (error: any) => {
      toast({
        description: error.message || context.dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const destroyMutation = useMutation({
    mutationFn: () => {
      const model = table.getFilteredSelectedRowModel();
      const ids = model.rows.map((r) => r.original.id);

      if (!ids.length) {
        throw new Error(context.dictionary.referral.destroyMany.noSelection);
      }

      return referralDestroyManyApiCall(ids);
    },
    onSuccess: () => {
      table.resetRowSelection();
      queryClient.resetQueries({
        queryKey: ['referral'],
      });
      toast({
        description: dictionary.referral.destroyMany.success,
      });
    },
    onError: (error: any) => {
      toast({
        description: error.message || context.dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => {
      const model = table.getFilteredSelectedRowModel();
      const ids = model.rows.map((r) => r.original.id);

      if (!ids.length) {
        throw new Error(context.dictionary.referral.archiveMany.noSelection);
      }

      return referralArchiveManyApiCall(ids);
    },
    onSuccess: () => {
      table.resetRowSelection();
      queryClient.resetQueries({
        queryKey: ['referral'],
      });
      toast({
        description: dictionary.referral.archiveMany.success,
      });
    },
    onError: (error: any) => {
      toast({
        description: error.message || context.dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: () => {
      const model = table.getFilteredSelectedRowModel();
      const ids = model.rows.map((r) => r.original.id);

      if (!ids.length) {
        throw new Error(context.dictionary.referral.restoreMany.noSelection);
      }

      return referralRestoreManyApiCall(ids);
    },
    onSuccess: () => {
      table.resetRowSelection();
      queryClient.resetQueries({
        queryKey: ['referral'],
      });
      toast({
        description: dictionary.referral.restoreMany.success,
      });
    },
    onError: (error: any) => {
      toast({
        description: error.message || context.dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  const isLoading =
    destroyMutation.isPending ||
    exportMutation.isPending ||
    archiveMutation.isPending ||
    restoreMutation.isPending;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto flex h-8">
            {isLoading ? (
              <LuLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RxDotsHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {hasPermissionToArchive && (
            <DropdownMenuItem
              onClick={() => setArchiveManyDialogOpen(true)}
              disabled={
                !selectedCount ||
                archiveMutation.isPending ||
                restoreMutation.isPending
              }
            >
              <FaArchive className="mr-2 h-4 w-4 text-foreground/50" />{' '}
              <span>{dictionary.shared.archive}</span>
            </DropdownMenuItem>
          )}
          {hasPermissionToRestore && (
            <DropdownMenuItem
              onClick={() => setRestoreManyDialogOpen(true)}
              disabled={
                !selectedCount ||
                archiveMutation.isPending ||
                restoreMutation.isPending
              }
            >
              <FaUndo className="mr-2 h-4 w-4 text-foreground/50" />{' '}
              <span>{dictionary.shared.restore}</span>
            </DropdownMenuItem>
          )}
          {hasPermissionToDestroy && (
            <DropdownMenuItem
              onClick={() => setDestroyManyDialogOpen(true)}
              disabled={!selectedCount || destroyMutation.isPending}
            >
              <FaTrashAlt className="mr-2 h-4 w-4 text-foreground/50" />{' '}
              <span>{dictionary.shared.delete}</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => exportMutation.mutateAsync()}
            disabled={!count || exportMutation.isPending}
          >
            <FaRegFileExcel className="mr-2 h-4 w-4 text-foreground/50" />{' '}
            <span>{dictionary.shared.exportToCsv}</span>
          </DropdownMenuItem>
          {hasPermissionToImport && (
            <DropdownMenuItem asChild>
              <Link href={`/referral/importer`} prefetch={false}>
                <MdUpload className="mr-2 h-4 w-4 text-foreground/50" />{' '}
                <span>{dictionary.shared.importer.title}</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DataTableViewOptions table={table} dictionary={context.dictionary} />

      {hasPermissionToCreate && (
        <Button
          size="sm"
          className="ml-auto flex h-8 whitespace-nowrap"
          asChild
        >
          <Link href={`/admin/referral/new`} prefetch={false}>
            <FaPlus className="mr-2 h-4 w-4" />
            <span>{dictionary.shared.new}</span>
          </Link>
        </Button>
      )}

      {archiveManyDialogOpen && (
        <ConfirmDialog
          title={dictionary.referral.archiveMany.confirmTitle}
          description={formatTranslation(
            dictionary.referral.archiveMany.confirmDescription,
            selectedCount,
          )}
          confirmText={dictionary.shared.archive}
          variant="destructive"
          cancelText={dictionary.shared.cancel}
          onConfirm={() => {
            archiveMutation.mutateAsync();
            setArchiveManyDialogOpen(false);
          }}
          onCancel={() => setArchiveManyDialogOpen(false)}
        />
      )}

      {restoreManyDialogOpen && (
        <ConfirmDialog
          title={dictionary.referral.restoreMany.confirmTitle}
          description={formatTranslation(
            dictionary.referral.restoreMany.confirmDescription,
            selectedCount,
          )}
          confirmText={dictionary.shared.restore}
          variant="destructive"
          cancelText={dictionary.shared.cancel}
          onConfirm={() => {
            restoreMutation.mutateAsync();
            setRestoreManyDialogOpen(false);
          }}
          onCancel={() => setRestoreManyDialogOpen(false)}
        />
      )}

      {destroyManyDialogOpen && (
        <ConfirmDialog
          title={dictionary.referral.destroyMany.confirmTitle}
          description={formatTranslation(
            dictionary.referral.destroyMany.confirmDescription,
            selectedCount,
          )}
          confirmText={dictionary.shared.delete}
          variant="destructive"
          cancelText={dictionary.shared.cancel}
          onConfirm={() => {
            destroyMutation.mutateAsync();
            setDestroyManyDialogOpen(false);
          }}
          onCancel={() => setDestroyManyDialogOpen(false)}
        />
      )}
    </>
  );
}
