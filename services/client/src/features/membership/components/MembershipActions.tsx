'use client';

import { Membership } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  FaEdit,
  FaEnvelope,
  FaEye,
  FaHistory,
  FaSearch,
  FaTrashAlt,
} from 'react-icons/fa';
import { RxDotsHorizontal } from 'react-icons/rx';
import {
  membershipDestroyManyApiCall,
  membershipResendInvitationEmailApiCall,
} from 'src/features/membership/membershipApiCalls';
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

export function MembershipActions({
  mode,
  membership,
  context,
}: {
  mode: 'table' | 'view';
  membership: Membership;
  context: AppContext;
}) {
  const { dictionary } = context;
  const router = useRouter();

  const [destroyDialogOpen, setDestroyDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const hasPermissionToEdit = hasPermission(
    permissions.membershipUpdate,
    context,
  );

  const hasPermissionToAuditLogs = hasPermission(
    permissions.auditLogRead,
    context,
  );

  const hasPermissionToDestroy = hasPermission(
    permissions.membershipDestroy,
    context,
  );

  const resendInvitationEmailMutation = useMutation({
    mutationFn: () => {
      return membershipResendInvitationEmailApiCall(membership.id);
    },
    onSuccess: () => {
      toast({
        description: dictionary.membership.resendInvitationEmail.success,
      });
    },
    onError: (error: any) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const destroyMutation = useMutation({
    mutationFn: () => {
      return membershipDestroyManyApiCall([membership.id]);
    },
    onSuccess: () => {
      queryClient.resetQueries({
        queryKey: ['membership'],
      });

      if (mode === 'view') {
        router.push('/membership');
      }

      toast({
        description: dictionary.membership.destroy.success,
      });
    },
    onError: (error: any) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  if (mode === 'view' && !hasPermissionToEdit && !hasPermissionToDestroy) {
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
              data-testid={`membership-actions-${membership.id}`}
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
              <Link href={`/membership/${membership.id}`} prefetch={false}>
                <FaSearch className="mr-2 h-4 w-4 text-foreground/50" />{' '}
                {dictionary.shared.view}
              </Link>
            </DropdownMenuItem>
          )}

          {hasPermissionToEdit && membership.status === 'invited' && (
            <DropdownMenuItem
              onClick={() => resendInvitationEmailMutation.mutateAsync()}
              disabled={resendInvitationEmailMutation.isPending}
              data-testid={`membership-actions-${membership.id}-resend-invitation-email`}
            >
              <FaEnvelope className="mr-2 h-4 w-4 text-foreground/50" />{' '}
              <span>{dictionary.membership.resendInvitationEmail.button}</span>
            </DropdownMenuItem>
          )}

          {mode === 'table' && hasPermissionToEdit && (
            <DropdownMenuItem asChild>
              <Link href={`/membership/${membership.id}/edit`} prefetch={false}>
                <FaEdit className="mr-2 h-4 w-4 text-foreground/50" />{' '}
                {dictionary.shared.edit}
              </Link>
            </DropdownMenuItem>
          )}

          {mode === 'table' && hasPermissionToAuditLogs && (
            <DropdownMenuItem asChild>
              <Link
                href={`/audit-log?${objectToQuery({
                  filter: {
                    membership: {
                      id: membership.id,
                      fullName: membership.fullName,
                    },
                  },
                })}`}
                data-testid={`membership-actions-${membership.id}-show-activity`}
                prefetch={false}
              >
                <FaEye className="mr-2 h-4 w-4 text-foreground/50" />{' '}
                {dictionary.membership.showActivity}
              </Link>
            </DropdownMenuItem>
          )}

          {hasPermissionToAuditLogs && (
            <DropdownMenuItem asChild>
              <Link
                href={`/audit-log?${objectToQuery({
                  filter: {
                    entityId: membership.id,
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
              data-testid={`membership-actions-${membership.id}-destroy`}
            >
              <FaTrashAlt className="mr-2 h-4 w-4 text-foreground/50" />{' '}
              <span>{dictionary.shared.delete}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {mode === 'view' && hasPermissionToAuditLogs && (
        <Button
          variant={'outline'}
          size="sm"
          className="ml-auto flex h-8 whitespace-nowrap"
          asChild
        >
          <Link
            href={`/audit-log?${objectToQuery({
              filter: {
                membership: {
                  id: membership.id,
                  fullName: membership.fullName,
                },
              },
            })}`}
            data-testid={`membership-actions-${membership.id}-show-activity`}
            prefetch={false}
          >
            <FaEye className="mr-2 h-4 w-4" />{' '}
            {dictionary.membership.showActivity}
          </Link>
        </Button>
      )}

      {mode === 'view' && hasPermissionToEdit && (
        <Button size="sm" className="ml-auto flex h-8" asChild>
          <Link href={`/membership/${membership.id}/edit`} prefetch={false}>
            <FaEdit className="mr-2 h-4 w-4" /> {dictionary.shared.edit}
          </Link>
        </Button>
      )}

      {destroyDialogOpen && (
        <ConfirmDialog
          title={dictionary.membership.destroy.confirmTitle}
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
