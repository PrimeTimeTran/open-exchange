'use client';

import { Tenant } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LuCreditCard,
  LuFile,
  LuKey,
  LuLock,
  LuLogOut,
  LuSettings,
  LuUser,
} from 'react-icons/lu';
import { authSignOutApiCall } from 'src/features/auth/authApiCalls';
import { membershipAcronym } from 'src/features/membership/membershipAcronym';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import TenantFormDialog from 'src/features/tenant/components/TenantFormDialog';
import { tenantDestroyApiCall } from 'src/features/tenant/tenantApiCalls';
import { ConfirmDialog } from 'src/shared/components/ConfirmDialog';
import { cn } from 'src/shared/components/cn';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from 'src/shared/components/ui/avatar';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { downloadUrl } from 'src/shared/lib/downloadUrl';
import { formatTranslation } from 'src/translation/formatTranslation';

export function AuthenticatedUserNav({
  context,
  isSidebar,
}: {
  isSidebar?: boolean;
  context: AppContext;
}) {
  const router = useRouter();

  const [tenantToEdit, setTenantToEdit] = useState<Tenant | null | undefined>();
  const [tenantToDestroy, setTenantToDestroy] = useState<
    Tenant | null | undefined
  >();

  const destroyMutation = useMutation({
    mutationFn: (id: string) => {
      return tenantDestroyApiCall(id);
    },
    onSuccess: () => {
      toast({
        description: context.dictionary.tenant.destroy.success,
      });
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        description: error.message || context.dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const hasPermissionToApiKeyRead = hasPermission(
    permissions.apiKeyRead,
    context,
  );

  const hasPermissionToReadSubscription =
    process.env.NEXT_PUBLIC_SUBSCRIPTION_MODE !== 'disabled' &&
    hasPermission(permissions.subscriptionRead, context);

  const hasPermissionToEditTenant = hasPermission(
    permissions.tenantEdit,
    context,
  );

  const signOutMutation = useMutation({
    mutationFn: () => {
      return authSignOutApiCall();
    },
    onSuccess: () => {
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        description: error.message || context.dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  return (
    <>
      <DropdownMenu>
        {isSidebar ? (
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'relative flex w-full items-center space-x-2 rounded-lg p-2 text-sm font-medium text-gray-500 ring-offset-background transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-gray-300 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:active:bg-gray-700',
              )}
              data-testid="authenticated-user-nav-button-desktop"
            >
              <Avatar className="mr-2 h-4 w-4 rounded-full">
                <AvatarImage
                  src={downloadUrl(context.currentMembership?.avatars)}
                  alt={context?.currentUser?.email}
                  className="object-cover"
                />
                <AvatarFallback className="bg-transparent">
                  {membershipAcronym(
                    context.currentUser,
                    context.currentMembership,
                  )}
                </AvatarFallback>
              </Avatar>

              <span className="truncate">
                {context?.currentMembership?.fullName}
              </span>
            </button>
          </DropdownMenuTrigger>
        ) : (
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative flex justify-start gap-4"
              data-testid="authenticated-user-nav-button-mobile"
            >
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage
                  src={downloadUrl(context.currentMembership?.avatars)}
                  alt={context?.currentUser?.email}
                  className="object-cover"
                />
                <AvatarFallback className="bg-background text-muted-foreground">
                  {membershipAcronym(
                    context.currentUser,
                    context.currentMembership,
                  )}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
        )}
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {context.currentMembership?.fullName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {context.currentUser?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => router.push('/auth/profile')}>
              <LuUser className="mr-2 h-4 w-4" />
              <span>{context.dictionary.auth.profile.menu}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => router.push('/auth/password-change')}
            >
              <LuLock className="mr-2 h-4 w-4" />
              <span>{context.dictionary.auth.passwordChange.menu}</span>
            </DropdownMenuItem>
            {hasPermissionToReadSubscription && (
              <DropdownMenuItem onSelect={() => router.push('/subscription')}>
                <LuCreditCard className="mr-2 h-4 w-4" />
                <span>{context.dictionary.subscription.menu}</span>
              </DropdownMenuItem>
            )}
            {hasPermissionToApiKeyRead ? (
              <DropdownMenuItem onSelect={() => router.push('/api-key')}>
                <LuKey className="mr-2 h-4 w-4" />
                <span>{context.dictionary.apiKey.list.menu}</span>
              </DropdownMenuItem>
            ) : null}
            {hasPermissionToApiKeyRead ? (
              <DropdownMenuItem onSelect={() => router.push('/api-docs')}>
                <LuFile className="mr-2 h-4 w-4" />
                <span>{context.dictionary.apiKey.docs.menu}</span>
              </DropdownMenuItem>
            ) : null}
            {process.env.NEXT_PUBLIC_TENANT_MODE === 'multi' &&
            hasPermissionToEditTenant ? (
              <DropdownMenuItem
                onSelect={() => setTenantToEdit(context.currentTenant)}
              >
                <LuSettings className="mr-2 h-4 w-4" />
                <span>{context.dictionary.tenant.form.edit.title}</span>
              </DropdownMenuItem>
            ) : (
              ''
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => signOutMutation.mutateAsync()}>
            <LuLogOut className="mr-2 h-4 w-4" />
            <span>{context.dictionary.auth.signOut.menu}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {tenantToDestroy && (
        <ConfirmDialog
          title={context.dictionary.tenant.destroy.confirmTitle}
          description={formatTranslation(
            context.dictionary.tenant.destroy.confirmDescription,
            tenantToDestroy.name,
          )}
          confirmText={context.dictionary.shared.delete}
          variant="destructive"
          cancelText={context.dictionary.shared.cancel}
          onConfirm={() => {
            destroyMutation.mutateAsync(tenantToDestroy.id);
          }}
          onCancel={() => setTenantToDestroy(null)}
          loading={destroyMutation.isPending || destroyMutation.isSuccess}
        />
      )}

      {tenantToEdit && (
        <TenantFormDialog
          context={context}
          tenant={tenantToEdit}
          onClose={() => setTenantToEdit(undefined)}
          onDestroy={() => {
            setTenantToDestroy(tenantToEdit);
            setTenantToEdit(undefined);
          }}
        />
      )}
    </>
  );
}
