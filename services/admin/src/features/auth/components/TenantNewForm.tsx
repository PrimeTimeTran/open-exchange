'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { tenantCreateApiCall } from 'src/features/tenant/tenantApiCalls';
import { cn } from 'src/shared/components/cn';
import { Button } from 'src/shared/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'src/shared/components/ui/form';
import { Input } from 'src/shared/components/ui/input';
import { toast } from 'src/shared/components/ui/use-toast';
import { getZodErrorMap } from 'src/translation/getZodErrorMap';
import { Dictionary, Locale } from 'src/translation/locales';
import { z } from 'zod';

export function TenantNewForm({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const router = useRouter();

  z.setErrorMap(getZodErrorMap(locale));

  const schema = z.object({
    name: z.string().min(1).max(255),
  });

  const [initialValues] = React.useState({
    name: '',
  });

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) => {
      return tenantCreateApiCall(data);
    },
    onSuccess: () => {
      toast({
        description: dictionary.auth.tenant.create.success,
      });

      router.push(`/auth/profile-onboard`);
    },
    onError: (error: Error) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    mutation.mutateAsync(data);
  };

  return (
    <div className={cn('grid gap-6')}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.auth.tenant.create.name}</FormLabel>
                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      autoFocus
                      {...field}
                    />
                    <FormMessage data-testid="name-error" />
                  </FormItem>
                )}
              />
            </div>
            <Button
              className="mt-2"
              disabled={mutation.isPending || mutation.isSuccess}
              type="submit"
            >
              {(mutation.isPending || mutation.isSuccess) && (
                <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {dictionary.auth.tenant.create.button}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
