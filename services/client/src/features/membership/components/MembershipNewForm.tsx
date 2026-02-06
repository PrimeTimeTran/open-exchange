import { zodResolver } from '@hookform/resolvers/zod';
import { Membership } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { LuLoader2 } from 'react-icons/lu';
import { ImagesInput } from 'src/features/file/components/ImagesInput';
import {
  membershipCreateApiCall,
  membershipUpdateApiCall,
} from 'src/features/membership/membershipApiCalls';
import {
  MembershipWithUser,
  membershipCreateInputSchema,
} from 'src/features/membership/membershipSchemas';
import { roles } from 'src/features/roles';
import { storage } from 'src/features/storage';
import SelectMultipleInput from 'src/shared/components/form/SelectMultipleInput';
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
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { getZodErrorMap } from 'src/translation/getZodErrorMap';
import { z } from 'zod';

export function MembershipNewForm({
  membership,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (membership: MembershipWithUser) => void;
  membership?: Partial<MembershipWithUser>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  const queryClient = useQueryClient();

  z.setErrorMap(getZodErrorMap(locale));

  const [initialValues] = React.useState({
    email: membership?.user?.email || '',
    firstName: membership?.firstName || '',
    lastName: membership?.lastName || '',
    avatars: membership?.avatars || [],
    roles: membership?.roles || [],
  });

  const form = useForm({
    resolver: zodResolver(membershipCreateInputSchema),
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  React.useEffect(() => {
    if (form.formState.isDirty) {
      setUnsavedChanges({
        message: dictionary.shared.unsavedChanges.message,
        dismissButtonLabel: dictionary.shared.unsavedChanges.dismiss,
        proceedLinkLabel: dictionary.shared.unsavedChanges.proceed,
        saveLabel: dictionary.shared.unsavedChanges.saveChanges,
        saveAction: () => form.handleSubmit(onSubmit)(),
      });
    } else {
      clearUnsavedChanges();
    }
  }, [form.formState.isDirty]);

  const mutation = useMutation({
    mutationFn: (data: z.input<typeof membershipCreateInputSchema>) => {
      if (membership?.id) {
        return membershipUpdateApiCall(membership.id, data);
      } else {
        return membershipCreateApiCall(data);
      }
    },
    onSuccess: (membership: Membership) => {
      queryClient.invalidateQueries({
        queryKey: ['membership'],
      });

      clearUnsavedChanges();
      onSuccess(membership);

      toast({
        description: dictionary.membership.new.success,
      });
    },
    onError: (error: Error) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutateAsync(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
      >
        <div className="grid w-full gap-8">
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">
                    {dictionary.membership.fields.email}
                  </FormLabel>
                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
                    {...field}
                  />
                  <FormMessage data-testid="email-error" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">
                    {dictionary.membership.fields.roles}
                  </FormLabel>
                  <SelectMultipleInput
                    options={Object.keys(roles).map((value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.membership.enumerators.roles,
                        value,
                      ),
                    }))}
                    dictionary={dictionary}
                    disabled={mutation.isPending || mutation.isSuccess}
                    onChange={field.onChange}
                    value={field.value}
                    dataTestid="roles"
                  />
                  <FormMessage data-testid="roles-error" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.membership.fields.firstName}
                  </FormLabel>
                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
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
                  <FormLabel>{dictionary.membership.fields.lastName}</FormLabel>
                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />
                  <FormMessage data-testid="lastName-error" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="avatars"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.membership.fields.avatars}</FormLabel>
                  <div>
                    <ImagesInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      storage={storage.membershipAvatars}
                      disabled={mutation.isPending || mutation.isSuccess}
                    />
                  </div>
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
                <LuLoader2 className="mr-2 size-4 animate-spin" />
              )}
              {dictionary.shared.save}
            </Button>

            <Button
              disabled={mutation.isPending || mutation.isSuccess}
              type="button"
              variant={'secondary'}
              onClick={() => {
                clearUnsavedChanges();
                onCancel();
              }}
            >
              {dictionary.shared.cancel}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
