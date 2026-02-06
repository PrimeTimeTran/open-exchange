import { zodResolver } from '@hookform/resolvers/zod';
import { UserNotification } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { UserNotificationWithRelationships } from 'src/features/userNotification/userNotificationSchemas';
import {
  userNotificationCreateApiCall,
  userNotificationUpdateApiCall,
} from 'src/features/userNotification/userNotificationApiCalls';
import { AppContext } from 'src/shared/controller/appContext';
import { Button } from 'src/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'src/shared/components/ui/form';
import { toast } from 'src/shared/components/ui/use-toast';
import { getZodErrorMap } from 'src/translation/getZodErrorMap';
import { z } from 'zod';
import { userNotificationCreateInputSchema } from 'src/features/userNotification/userNotificationSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import DateTimePickerInput from 'src/shared/components/form/DateTimePickerInput';
import { userNotificationEnumerators } from 'src/features/userNotification/userNotificationEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { RadioGroup, RadioGroupItem } from 'src/shared/components/ui/radio-group';
import { Textarea } from 'src/shared/components/ui/textarea';
import { NotificationAutocompleteInput } from 'src/features/notification/components/NotificationAutocompleteInput';
import { MembershipAutocompleteInput } from 'src/features/membership/components/MembershipAutocompleteInput';

export function UserNotificationForm({
  userNotification,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (userNotification: UserNotificationWithRelationships) => void;
  userNotification?: Partial<UserNotificationWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(userNotification?.id);

  const [initialValues] = React.useState({
    readAt: userNotification?.readAt || '',
    dismissedAt: userNotification?.dismissedAt || '',
    acknowledgedAt: userNotification?.acknowledgedAt || '',
    deliveryChannel: userNotification?.deliveryChannel || null,
    deliveredAt: userNotification?.deliveredAt || '',
    meta: userNotification?.meta?.toString() || '',
    notification: userNotification?.notification || null,
    user: userNotification?.user || null,
  });

  const form = useForm({
    resolver: zodResolver(userNotificationCreateInputSchema),
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
    mutationFn: (data: z.input<typeof userNotificationCreateInputSchema>) => {
      if (userNotification?.id) {
        return userNotificationUpdateApiCall(userNotification.id, data);
      } else {
        return userNotificationCreateApiCall(data);
      }
    },
    onSuccess: (userNotification: UserNotification) => {
      queryClient.invalidateQueries({
        queryKey: ['userNotification'],
      });

      onSuccess(userNotification);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.userNotification.edit.success
          : dictionary.userNotification.new.success,
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
              name="readAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.userNotification.fields.readAt}
                  </FormLabel>

                  <div>
                    <DateTimePickerInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      disabled={mutation.isPending || mutation.isSuccess}
                      isClearable={true}
                    />
                  </div>

                  {dictionary.userNotification.hints.readAt ? (
                    <FormDescription>
                      {dictionary.userNotification.hints.readAt}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="readAt-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="dismissedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.userNotification.fields.dismissedAt}
                  </FormLabel>

                  <div>
                    <DateTimePickerInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      disabled={mutation.isPending || mutation.isSuccess}
                      isClearable={true}
                    />
                  </div>

                  {dictionary.userNotification.hints.dismissedAt ? (
                    <FormDescription>
                      {dictionary.userNotification.hints.dismissedAt}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="dismissedAt-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="acknowledgedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.userNotification.fields.acknowledgedAt}
                  </FormLabel>

                  <div>
                    <DateTimePickerInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      disabled={mutation.isPending || mutation.isSuccess}
                      isClearable={true}
                    />
                  </div>

                  {dictionary.userNotification.hints.acknowledgedAt ? (
                    <FormDescription>
                      {dictionary.userNotification.hints.acknowledgedAt}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="acknowledgedAt-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="deliveryChannel"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{dictionary.userNotification.fields.deliveryChannel}</FormLabel>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      className="flex flex-col space-y-1"
                      disabled={mutation.isPending || mutation.isSuccess}
                    >
                      {Object.keys(userNotificationEnumerators.deliveryChannel).map(
                        (deliveryChannel) => (
                          <FormItem
                            key={deliveryChannel}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={deliveryChannel} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {enumeratorLabel(
                                dictionary.userNotification.enumerators.deliveryChannel,
                                deliveryChannel,
                              )}
                            </FormLabel>
                          </FormItem>
                        ),
                      )}
                    </RadioGroup>
                  </FormControl>

                  {Boolean(field.value) && (
                    <button
                      type="button"
                      className="mt-2 text-sm text-muted-foreground underline"
                      onClick={() => field.onChange(null)}
                    >
                      {dictionary.shared.clear}
                    </button>
                  )}

                  {dictionary.userNotification.hints.deliveryChannel ? (
                    <FormDescription>
                      {dictionary.userNotification.hints.deliveryChannel}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="deliveryChannel-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="deliveredAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.userNotification.fields.deliveredAt}
                  </FormLabel>

                  <div>
                    <DateTimePickerInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      disabled={mutation.isPending || mutation.isSuccess}
                      isClearable={true}
                    />
                  </div>

                  {dictionary.userNotification.hints.deliveredAt ? (
                    <FormDescription>
                      {dictionary.userNotification.hints.deliveredAt}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="deliveredAt-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="meta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.userNotification.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.userNotification.hints.meta ? (
                    <FormDescription>
                      {dictionary.userNotification.hints.meta}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="meta-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="notification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.userNotification.fields.notification}</FormLabel>

                  <NotificationAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.userNotification.hints.notification ? (
                    <FormDescription>
                      {dictionary.userNotification.hints.notification}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="notification-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.userNotification.fields.user}</FormLabel>

                  <MembershipAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.userNotification.hints.user ? (
                    <FormDescription>
                      {dictionary.userNotification.hints.user}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="user-error" />
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
