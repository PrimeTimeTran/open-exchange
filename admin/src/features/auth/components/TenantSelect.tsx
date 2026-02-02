'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { sortBy } from 'lodash';
import { LuLoader2 } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { authTenantSelectApiCall as authFetchTenantSelect } from 'src/features/auth/authApiCalls';
import { MembershipWithTenant } from 'src/features/membership/membershipSchemas';
import { membershipAcceptInvitationApiCall } from 'src/features/membership/membershipApiCalls';
import { cn } from 'src/shared/components/cn';
import { Button } from 'src/shared/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
} from 'src/shared/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/shared/components/ui/select';
import { toast } from 'src/shared/components/ui/use-toast';
import { getZodErrorMap } from 'src/translation/getZodErrorMap';
import { Dictionary, Locale } from 'src/translation/locales';
import { z } from 'zod';

export function TenantSelect({
  locale,
  dictionary,
  memberships,
}: {
  locale: Locale;
  dictionary: Dictionary;
  memberships?: Array<MembershipWithTenant>;
}) {
  const router = useRouter();

  z.setErrorMap(getZodErrorMap(locale));

  const schema = z.object({
    tenantId: z.string(),
  });

  const [initialValues] = React.useState({
    tenantId: memberships?.[0]?.tenantId,
  });

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  const selectTenantMutation = useMutation({
    mutationFn: (tenantId: string) => {
      return authFetchTenantSelect(tenantId);
    },
    onSuccess: () => {
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: (token: string) => {
      return membershipAcceptInvitationApiCall(token);
    },
    onSuccess: () => {
      toast({
        description: dictionary.auth.tenant.select.joinSuccess,
      });
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: Partial<z.infer<typeof schema>>) => {
    const membership = memberships?.find(
      (membership) => membership.tenantId === tenantId,
    );

    if (membership?.invitationToken) {
      acceptInvitationMutation.mutateAsync(membership.invitationToken);
    } else if (data?.tenantId) {
      selectTenantMutation.mutateAsync(data?.tenantId);
    }
  };

  const tenantId = form.watch('tenantId');
  const membership = memberships?.find(
    (membership) => membership.tenantId === tenantId,
  );

  const isLoadingOrSuccess =
    acceptInvitationMutation.isPending ||
    selectTenantMutation.isPending ||
    acceptInvitationMutation.isSuccess ||
    selectTenantMutation.isPending;

  return (
    <div className={cn('grid gap-6')}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <FormField
                control={form.control}
                name="tenantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.auth.tenant.select.tenant}
                    </FormLabel>
                    <Select
                      data-testid="tenant-id-select"
                      disabled={isLoadingOrSuccess}
                      {...field}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortBy(
                          memberships,
                          (membership) => membership.tenant?.name,
                        ).map((membership) => (
                          <SelectItem
                            key={membership.tenantId}
                            value={membership.tenantId}
                          >
                            {membership.tenant?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <Button
              className="mt-2"
              disabled={isLoadingOrSuccess}
              type="submit"
            >
              {isLoadingOrSuccess && (
                <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {membership?.invitationToken
                ? dictionary.auth.tenant.select.acceptInvitation
                : dictionary.auth.tenant.select.select}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
