'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import Link from 'src/shared/components/Link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import {
  FileUploaded,
  fileUploadedSchema,
} from 'src/features/file/fileSchemas';
import { ImagesInput } from 'src/features/file/components/ImagesInput';
import { membershipUpdateMeApiCall } from 'src/features/membership/membershipApiCalls';
import { storage } from 'src/features/storage';
import { AppContext } from 'src/shared/controller/appContext';
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
import { z } from 'zod';

export function ProfileForm({ context }: { context: AppContext }) {
  const { locale, dictionary, currentMembership } = context;
  const router = useRouter();

  z.setErrorMap(getZodErrorMap(locale));

  const schema = z.object({
    firstName: z.string().min(1).max(255),
    lastName: z.string().min(1).max(255),
    avatars: z.array(fileUploadedSchema),
  });

  const [initialValues] = React.useState({
    firstName: currentMembership?.firstName || '',
    lastName: currentMembership?.lastName || '',
    avatars: (currentMembership?.avatars as FileUploaded[]) || [],
  });

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) => {
      return membershipUpdateMeApiCall(data);
    },
    onSuccess: () => {
      router.push(`/`);

      toast({
        description: dictionary.auth.profile.success,
      });
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid w-full gap-8">
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.auth.profile.firstName}</FormLabel>
                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
                    {...field}
                  />
                  <FormMessage data-testid="firstName-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.auth.profile.lastName}</FormLabel>
                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />
                  <FormMessage data-testid="lastName-error" />
                </FormItem>
              )}
            />
          </div>

          <div className="max-2-lg grid gap-1">
            <FormField
              control={form.control}
              name="avatars"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.auth.profile.avatars}</FormLabel>
                  <ImagesInput
                    value={field.value}
                    onChange={field.onChange}
                    dictionary={dictionary}
                    storage={storage.membershipAvatars}
                    max={1}
                  />
                  <FormMessage data-testid="avatars-error" />
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
              {dictionary.auth.profile.button}
            </Button>

            <Link href={`/`} prefetch={false}>
              <Button
                disabled={mutation.isPending || mutation.isSuccess}
                type="button"
                variant={'secondary'}
              >
                {dictionary.auth.profile.cancel}
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
