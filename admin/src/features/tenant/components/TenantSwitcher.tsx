'use client';

import { useMutation } from '@tanstack/react-query';
import { sortBy } from 'lodash';
import * as React from 'react';
import { FaCheck } from 'react-icons/fa';
import { LuBuilding, LuNetwork } from 'react-icons/lu';
import { RxCaretSort, RxPlusCircled } from 'react-icons/rx';
import { authTenantSelectApiCall } from 'src/features/auth/authApiCalls';
import { MembershipWithTenant } from 'src/features/membership/membershipSchemas';
import TenantFormDialog from 'src/features/tenant/components/TenantFormDialog';
import { TenantInvitationDialog } from 'src/features/tenant/components/TenantInvitationDialog';
import { cn } from 'src/shared/components/cn';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from 'src/shared/components/ui/avatar';
import { Button } from 'src/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from 'src/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'src/shared/components/ui/popover';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';

export default function TenantSwitcher({
  isSidebar,
  context,
}: {
  isSidebar?: boolean;
  context: AppContext;
}) {
  const { dictionary, currentTenant } = context;

  const [open, setOpen] = React.useState(false);
  const [formDialogOpen, setDialogOpen] = React.useState(false);
  const [invitationMembership, setInvitationMembership] =
    React.useState<MembershipWithTenant>();

  const mutation = useMutation({
    mutationFn: (id: string) => {
      return authTenantSelectApiCall(id);
    },
    onSuccess: () => {
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const memberships = sortBy(
    context.currentUser?.memberships,
    (membership) => membership?.tenant?.name,
  );

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        {isSidebar ? (
          <PopoverTrigger asChild>
            <button
              aria-expanded={open}
              aria-label={dictionary.tenant.switcher.placeholder}
              className={cn(
                'relative flex w-full items-center space-x-2 rounded-lg p-2 text-sm font-medium text-gray-500 ring-offset-background transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-gray-300 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:active:bg-gray-700',
              )}
              title={currentTenant?.name}
              data-testid="tenant-switcher-button-desktop"
            >
              <LuBuilding className="mr-2 h-4 w-4" />
              <span className="truncate">{currentTenant?.name}</span>
            </button>
          </PopoverTrigger>
        ) : (
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-9 p-0 px-1"
              data-testid="tenant-switcher-button-mobile"
              title={currentTenant?.name}
            >
              <LuBuilding className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
        )}
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput
                placeholder={dictionary.tenant.switcher.searchPlaceholder}
              />
              <CommandEmpty>
                {dictionary.tenant.switcher.searchEmpty}
              </CommandEmpty>
              <CommandGroup className="max-h-[340px] overflow-y-auto" heading={dictionary.tenant.switcher.title}>
                {memberships?.map((membership) => (
                  <CommandItem
                    key={membership.id}
                    onSelect={() => {
                      if (membership.invitationToken) {
                        setInvitationMembership(membership);
                      } else {
                        mutation.mutateAsync(membership?.tenant?.id!);
                      }
                      setOpen(false);
                    }}
                    className="text-sm"
                    data-testid={`tenant-switcher-item-${membership?.tenant!
                      .id}`}
                  >
                    <Avatar className="mr-2 h-5 w-5">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${encodeURIComponent(
                          membership?.tenant!.name || '',
                        )}.png`}
                        alt={membership?.tenant!.name}
                        className="grayscale"
                      />
                      <AvatarFallback>
                        {currentTenant?.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {membership?.tenant!.name}
                    <FaCheck
                      className={cn(
                        'ml-auto h-4 w-4',
                        currentTenant?.id === membership?.tenant!.id
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setDialogOpen(true);
                  }}
                >
                  <RxPlusCircled className="mr-2 h-5 w-5" />
                  {dictionary.tenant.switcher.create}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {invitationMembership && (
        <TenantInvitationDialog
          context={context}
          membership={invitationMembership}
          onClose={() => setInvitationMembership(undefined)}
        />
      )}

      {formDialogOpen && (
        <TenantFormDialog
          context={context}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  );
}
