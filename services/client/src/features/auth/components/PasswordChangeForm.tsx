'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'src/shared/components/Link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { LuLoader2 } from 'react-icons/lu';
import { authPasswordChangeApiCall } from 'src/features/auth/authApiCalls';
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
import { AppContext } from 'src/shared/controller/appContext';
import { getZodErrorMap } from 'src/translation/getZodErrorMap';
import { z } from 'zod';

export function PasswordChangeForm({ context }: { context: AppContext }) {
  const { locale, dictionary } = context;
  const router = useRouter();

  z.setErrorMap(getZodErrorMap(locale));

  const schema = z
    .object({
      oldPassword: z.string().min(1).max(255),
      newPassword: z.string().min(8).max(255),
      newPasswordConfirmation: z.string().min(8).max(255),
    })
    .refine(
      (data) => {
        return data.newPassword === data.newPasswordConfirmation;
      },
      {
        message: dictionary.auth.passwordChange.mustMatch,
        path: ['newPasswordConfirmation'],
      },
    );

  const [initialValues] = React.useState({
    oldPassword: '',
    newPassword: '',
    newPasswordConfirmation: '',
  });

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) => {
      return authPasswordChangeApiCall(data);
    },
    onSuccess: () => {
      router.push(`/auth/sign-in`);

      toast({
        description: dictionary.auth.passwordChange.success,
      });
    },
    onError: (error: Error) => {
      console.error(error);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid w-full gap-8">
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.auth.passwordChange.oldPassword}
                  </FormLabel>
                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    type="password"
                    autoFocus
                    {...field}
                  />
                  <FormMessage data-testid="oldPassword-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.auth.passwordChange.newPassword}
                  </FormLabel>
                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    type="password"
                    {...field}
                  />
                  <FormMessage data-testid="newPassword-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="newPasswordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.auth.passwordChange.newPasswordConfirmation}
                  </FormLabel>
                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    type="password"
                    {...field}
                  />
                  <FormMessage data-testid="newPasswordConfirmation-error" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2">
            <Button
              disabled={mutation.isPending || mutation.isSuccess}
              type="submit"
            >
              {(mutation.isPending || mutation.isSuccess) && (
                <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {dictionary.auth.passwordChange.button}
            </Button>

            <Link href={`/admin/`} prefetch={false}>
              <Button
                disabled={mutation.isPending || mutation.isSuccess}
                type="button"
                variant={'secondary'}
              >
                {dictionary.auth.passwordChange.cancel}
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
