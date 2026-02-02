'use client';

import { ApiKey } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { FaEdit, FaHistory, FaSearch, FaTrashAlt } from 'react-icons/fa';
import { RxDotsHorizontal } from 'react-icons/rx';
import { apiKeyDestroyApiCall } from 'src/features/apiKey/apiKeyApiCalls';
import { auditLogPermissions } from 'src/features/auditLog/auditLogPermissions';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { ConfirmDialog } from 'src/shared/components/ConfirmDialog';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { objectToQuery } from 'src/shared/lib/objectToQuery';

export function ApiKeyActions({
  apiKey,
  context,
}: {
  apiKey: ApiKey;
  context: AppContext;
}) {
  const { dictionary } = context;

  const [destroyDialogOpen, setDestroyDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const hasPermissionToAuditLogs = hasPermission(
    auditLogPermissions.auditLogRead,
    context,
  );

  const hasPermissionToEdit = hasPermission(permissions.apiKeyUpdate, context);

  const hasPermissionToDestroy = hasPermission(
    permissions.apiKeyDestroy,
    context,
  );

  const destroyMutation = useMutation({
    mutationFn: () => {
      return apiKeyDestroyApiCall(apiKey.id);
    },
    onSuccess: () => {
      queryClient.resetQueries({
        queryKey: ['apiKey'],
      });

      toast({
        description: dictionary.apiKey.destroy.success,
      });
    },
    onError: (error: any) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            data-testid={`api-key-actions-${apiKey.id}`}
          >
            <RxDotsHorizontal className="h-4 w-4 text-foreground/50" />
            <span className="sr-only">{dictionary.shared.openMenu}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[160px]">
          {hasPermissionToAuditLogs && (
            <DropdownMenuItem asChild>
              <Link
                href={`/audit-log?${objectToQuery({
                  filter: {
                    apiKey: {
                      id: apiKey.id,
                      name: apiKey.name,
                    },
                  },
                })}`}
                data-testid={`api-key-actions-${apiKey.id}-show-activity`}
                prefetch={false}
              >
                <FaSearch className="mr-2 h-4 w-4 text-foreground/50" />{' '}
                {dictionary.apiKey.list.viewActivity}
              </Link>
            </DropdownMenuItem>
          )}

          {hasPermissionToEdit && (
            <DropdownMenuItem asChild>
              <Link href={`/api-key/${apiKey.id}/edit`} prefetch={false}>
                <FaEdit className="mr-2 h-4 w-4 text-foreground/50" />{' '}
                {dictionary.shared.edit}
              </Link>
            </DropdownMenuItem>
          )}

          {hasPermissionToAuditLogs && (
            <DropdownMenuItem asChild>
              <Link
                href={`/audit-log?${objectToQuery({
                  filter: {
                    entityId: apiKey.id,
                  },
                })}`}
                prefetch={false}
              >
                <FaHistory className="mr-2 h-4 w-4 text-foreground/50" />{' '}
                {dictionary.auditLog.list.menu}
              </Link>
            </DropdownMenuItem>
          )}

          {hasPermissionToDestroy && (
            <DropdownMenuItem
              onClick={() => setDestroyDialogOpen(true)}
              disabled={destroyMutation.isPending}
              data-testid={`api-key-actions-${apiKey.id}-destroy`}
            >
              <FaTrashAlt className="mr-2 h-4 w-4 text-foreground/50" />{' '}
              <span>{dictionary.shared.delete}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {destroyDialogOpen && (
        <ConfirmDialog
          title={dictionary.apiKey.destroy.confirmTitle}
          confirmText={dictionary.shared.delete}
          variant="destructive"
          cancelText={dictionary.shared.cancel}
          onConfirm={() => {
            destroyMutation.mutateAsync();
            setDestroyDialogOpen(false);
          }}
          onCancel={() => setDestroyDialogOpen(false)}
          dataTestid="destroy-dialog"
        />
      )}
    </div>
  );
}
