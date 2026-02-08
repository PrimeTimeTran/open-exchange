'use client';

import { Post } from '@prisma/client';
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
  postDestroyManyApiCall,
  postFindManyApiCall,
  postArchiveManyApiCall,
  postRestoreManyApiCall,
} from 'src/features/post/postApiCalls';
import { postExporterMapper } from 'src/features/post/postExporterMapper';
import { postFilterInputSchema } from 'src/features/post/postSchemas';
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

export default function PostListActions({
  context,
  table,
  count,
  filter,
  sorting,
}: {
  filter: z.input<typeof postFilterInputSchema>;
  sorting: DataTableSort;
  count?: number;
  context: AppContext;
  table: Table<Post>;
}) {
  const { dictionary } = context;
  const queryClient = useQueryClient();

  const [destroyManyDialogOpen, setDestroyManyDialogOpen] = useState(false);
  const [restoreManyDialogOpen, setRestoreManyDialogOpen] = useState(false);
  const [archiveManyDialogOpen, setArchiveManyDialogOpen] = useState(false);

  const hasPermissionToCreate = hasPermission(permissions.postCreate, context);

  const hasPermissionToDestroy = hasPermission(
    permissions.postDestroy,
    context,
  );

  const hasPermissionToArchive = hasPermission(
    permissions.postArchive,
    context,
  );

  const hasPermissionToRestore = hasPermission(
    permissions.postRestore,
    context,
  );

  const hasPermissionToImport = hasPermission(permissions.postImport, context);

  const exportMutation = useMutation({
    mutationFn: () => {
      return postFindManyApiCall({
        filter: filter,
        orderBy: dataTableSortToPrisma(sorting),
      });
    },
    onSuccess: (data) => {
      csvExporter(
        postExporterMapper(data.posts, context),
        dictionary.post.fields,
        'posts',
      );
      toast({
        description: dictionary.post.export.success,
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
        throw new Error(context.dictionary.post.destroyMany.noSelection);
      }

      return postDestroyManyApiCall(ids);
    },
    onSuccess: () => {
      table.resetRowSelection();
      queryClient.resetQueries({
        queryKey: ['post'],
      });
      toast({
        description: dictionary.post.destroyMany.success,
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
        throw new Error(context.dictionary.post.archiveMany.noSelection);
      }

      return postArchiveManyApiCall(ids);
    },
    onSuccess: () => {
      table.resetRowSelection();
      queryClient.resetQueries({
        queryKey: ['post'],
      });
      toast({
        description: dictionary.post.archiveMany.success,
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
        throw new Error(context.dictionary.post.restoreMany.noSelection);
      }

      return postRestoreManyApiCall(ids);
    },
    onSuccess: () => {
      table.resetRowSelection();
      queryClient.resetQueries({
        queryKey: ['post'],
      });
      toast({
        description: dictionary.post.restoreMany.success,
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
              <Link href={`/admin/post/importer`} prefetch={false}>
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
          <Link href={`/admin/post/new`} prefetch={false}>
            <FaPlus className="mr-2 h-4 w-4" />
            <span>{dictionary.shared.new}</span>
          </Link>
        </Button>
      )}

      {archiveManyDialogOpen && (
        <ConfirmDialog
          title={dictionary.post.archiveMany.confirmTitle}
          description={formatTranslation(
            dictionary.post.archiveMany.confirmDescription,
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
          title={dictionary.post.restoreMany.confirmTitle}
          description={formatTranslation(
            dictionary.post.restoreMany.confirmDescription,
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
          title={dictionary.post.destroyMany.confirmTitle}
          description={formatTranslation(
            dictionary.post.destroyMany.confirmDescription,
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
