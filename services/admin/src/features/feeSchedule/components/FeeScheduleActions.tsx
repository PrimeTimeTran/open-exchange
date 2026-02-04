'use client';

import { FeeSchedule } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaEdit, FaHistory, FaSearch, FaTrashAlt, FaArchive, FaUndo } from 'react-icons/fa';
import { RxDotsHorizontal } from 'react-icons/rx';
import { feeScheduleDestroyManyApiCall, feeScheduleArchiveManyApiCall, feeScheduleRestoreManyApiCall } from 'src/features/feeSchedule/feeScheduleApiCalls';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { ConfirmDialog } from 'src/shared/components/ConfirmDialog';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import { toast } from 'src/shared/components/ui/use-toast';
import { auditLogPermissions } from 'src/features/auditLog/auditLogPermissions';
import { objectToQuery } from 'src/shared/lib/objectToQuery';

export function FeeScheduleActions({
  mode,
  feeSchedule,
  context,
}: {
  mode: 'table' | 'view';
  feeSchedule: FeeSchedule;
  context: AppContext;
}) {
  const { dictionary } = context;
  const router = useRouter();

  const [destroyDialogOpen, setDestroyDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const hasPermissionToEdit = hasPermission(permissions.feeScheduleUpdate, context);

  const hasPermissionToAuditLogs = hasPermission(
    auditLogPermissions.auditLogRead,
    context,
  );

  const hasPermissionToDestroy = hasPermission(
    permissions.feeScheduleDestroy,
    context,
  );

  const destroyMutation = useMutation({
    mutationFn: () => {
      return feeScheduleDestroyManyApiCall([feeSchedule.id]);
    },
    onSuccess: () => {
      queryClient.resetQueries({
        queryKey: ['feeSchedule'],
      });

      if (mode === 'view') {
        router.push('/fee-schedule');
      }

      toast({
        description: dictionary.feeSchedule.destroy.success,
      });
    },
    onError: (error: any) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const hasPermissionToArchive = hasPermission(
    permissions.feeScheduleArchive,
    context,
  );

  const archiveMutation = useMutation({
    mutationFn: () => {
      return feeScheduleArchiveManyApiCall([feeSchedule.id]);
    },
    onSuccess: () => {
      queryClient.resetQueries({
        queryKey: ['feeSchedule'],
      });

      if (mode === 'view') {
        router.push('/feeSchedule');
      }

      toast({
        description: dictionary.feeSchedule.archive.success,
      });
    },
    onError: (error: any) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const hasPermissionToRestore = hasPermission(
    permissions.feeScheduleRestore,
    context,
  );

  const restoreMutation = useMutation({
    mutationFn: () => {
      return feeScheduleRestoreManyApiCall([feeSchedule.id]);
    },
    onSuccess: () => {
      queryClient.resetQueries({
        queryKey: ['feeSchedule'],
      });

      if (mode === 'view') {
        router.push('/feeSchedule');
      }

      toast({
        description: dictionary.feeSchedule.restore.success,
      });
    },
    onError: (error: any) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  if (mode === 'view' && !hasPermissionToEdit && !hasPermissionToDestroy && !hasPermissionToArchive && !hasPermissionToRestore) {
    return null;
  }

  return (
    <div className="flex justify-end gap-2">
      <DropdownMenu>
        {mode === 'table' && (
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <RxDotsHorizontal className="h-4 w-4" />
              <span className="sr-only">{dictionary.shared.openMenu}</span>
            </Button>
          </DropdownMenuTrigger>
        )}

        {mode === 'view' && (
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto flex h-8">
              <RxDotsHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        )}

        <DropdownMenuContent align="end" className="w-[160px]">
          {mode === 'table' && (
            <DropdownMenuItem asChild>
              <Link href={`/fee-schedule/${feeSchedule.id}`} prefetch={false}>
                <FaSearch className="mr-2 h-4 w-4 text-foreground/50" />{' '}
                {dictionary.shared.view}
              </Link>
            </DropdownMenuItem>
          )}

          {mode === 'table' && hasPermissionToEdit && (
            <DropdownMenuItem asChild>
              <Link href={`/fee-schedule/${feeSchedule.id}/edit`} prefetch={false}>
                <FaEdit className="mr-2 h-4 w-4 text-foreground/50" />{' '}
                {dictionary.shared.edit}
              </Link>
            </DropdownMenuItem>
          )}

          {hasPermissionToAuditLogs && (
            <DropdownMenuItem asChild>
              <Link
                href={`/audit-log?${objectToQuery(
                  {
                    filter: {
                      entityId: feeSchedule.id,
                    },
                  },
                )}`}
                prefetch={false}
              >
                <FaHistory className="mr-2 h-4 w-4 text-foreground/50" />{' '}
                {dictionary.auditLog.list.menu}
              </Link>
            </DropdownMenuItem>
          )}

          {hasPermissionToArchive && !feeSchedule?.archivedAt && (
            <DropdownMenuItem
              onClick={() => setArchiveDialogOpen(true)}
              disabled={archiveMutation.isPending || restoreMutation.isPending}
            >
              <FaArchive className="mr-2 h-4 w-4 text-foreground/50" />{' '}
              <span>{dictionary.shared.archive}</span>
            </DropdownMenuItem>
          )}

          {hasPermissionToRestore && Boolean(feeSchedule?.archivedAt) && (
            <DropdownMenuItem
              onClick={() => setRestoreDialogOpen(true)}
              disabled={archiveMutation.isPending || restoreMutation.isPending}
            >
              <FaUndo className="mr-2 h-4 w-4 text-foreground/50" />{' '}
              <span>{dictionary.shared.restore}</span>
            </DropdownMenuItem>
          )}

          {hasPermissionToDestroy && (
            <DropdownMenuItem
              onClick={() => setDestroyDialogOpen(true)}
              disabled={destroyMutation.isPending}
            >
              <FaTrashAlt className="mr-2 h-4 w-4 text-foreground/50" />{' '}
              <span>{dictionary.shared.delete}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {mode === 'view' && hasPermissionToEdit && (
        <Button size="sm" className="ml-auto flex h-8" asChild>
          <Link href={`/fee-schedule/${feeSchedule.id}/edit`} prefetch={false}>
            <FaEdit className="mr-2 h-4 w-4" /> {dictionary.shared.edit}
          </Link>
        </Button>
      )}

      {archiveDialogOpen && (
        <ConfirmDialog
          title={dictionary.feeSchedule.archive.confirmTitle}
          confirmText={dictionary.shared.archive}
          variant="destructive"
          cancelText={dictionary.shared.cancel}
          onConfirm={() => {
            archiveMutation.mutateAsync();
            setArchiveDialogOpen(false);
          }}
          onCancel={() => setArchiveDialogOpen(false)}
        />
      )}

      {restoreDialogOpen && (
        <ConfirmDialog
          title={dictionary.feeSchedule.restore.confirmTitle}
          confirmText={dictionary.shared.restore}
          variant="destructive"
          cancelText={dictionary.shared.cancel}
          onConfirm={() => {
            restoreMutation.mutateAsync();
            setRestoreDialogOpen(false);
          }}
          onCancel={() => setRestoreDialogOpen(false)}
        />
      )}

      {destroyDialogOpen && (
        <ConfirmDialog
          title={dictionary.feeSchedule.destroy.confirmTitle}
          confirmText={dictionary.shared.delete}
          variant="destructive"
          cancelText={dictionary.shared.cancel}
          onConfirm={() => {
            destroyMutation.mutateAsync();
            setDestroyDialogOpen(false);
          }}
          onCancel={() => setDestroyDialogOpen(false)}
        />
      )}
    </div>
  );
}
