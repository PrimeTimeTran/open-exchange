import { zodResolver } from '@hookform/resolvers/zod';
import { Notification } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { NotificationWithRelationships } from 'src/features/notification/notificationSchemas';
import {
  notificationCreateApiCall,
  notificationUpdateApiCall,
} from 'src/features/notification/notificationApiCalls';
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
import { notificationCreateInputSchema } from 'src/features/notification/notificationSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { notificationEnumerators } from 'src/features/notification/notificationEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { RadioGroup, RadioGroupItem } from 'src/shared/components/ui/radio-group';
import { Input } from 'src/shared/components/ui/input';
import { Switch } from 'src/shared/components/ui/switch';
import { Textarea } from 'src/shared/components/ui/textarea';

export function NotificationForm({
  notification,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (notification: NotificationWithRelationships) => void;
  notification?: Partial<NotificationWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(notification?.id);

  const [initialValues] = React.useState({
    type: notification?.type || null,
    severity: notification?.severity || null,
    title: notification?.title || '',
    body: notification?.body || '',
    actionUrl: notification?.actionUrl || '',
    scope: notification?.scope || null,
    targetUserId: notification?.targetUserId || '',
    targetSegment: notification?.targetSegment || '',
    persistent: notification?.persistent || false,
    dismissible: notification?.dismissible || false,
    requiresAck: notification?.requiresAck || false,
    meta: notification?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(notificationCreateInputSchema),
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
    mutationFn: (data: z.input<typeof notificationCreateInputSchema>) => {
      if (notification?.id) {
        return notificationUpdateApiCall(notification.id, data);
      } else {
        return notificationCreateApiCall(data);
      }
    },
    onSuccess: (notification: Notification) => {
      queryClient.invalidateQueries({
        queryKey: ['notification'],
      });

      onSuccess(notification);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.notification.edit.success
          : dictionary.notification.new.success,
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
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{dictionary.notification.fields.type}</FormLabel>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      className="flex flex-col space-y-1"
                      disabled={mutation.isPending || mutation.isSuccess}
                    >
                      {Object.keys(notificationEnumerators.type).map(
                        (type) => (
                          <FormItem
                            key={type}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={type} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {enumeratorLabel(
                                dictionary.notification.enumerators.type,
                                type,
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

                  {dictionary.notification.hints.type ? (
                    <FormDescription>
                      {dictionary.notification.hints.type}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="type-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{dictionary.notification.fields.severity}</FormLabel>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      className="flex flex-col space-y-1"
                      disabled={mutation.isPending || mutation.isSuccess}
                    >
                      {Object.keys(notificationEnumerators.severity).map(
                        (severity) => (
                          <FormItem
                            key={severity}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={severity} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {enumeratorLabel(
                                dictionary.notification.enumerators.severity,
                                severity,
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

                  {dictionary.notification.hints.severity ? (
                    <FormDescription>
                      {dictionary.notification.hints.severity}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="severity-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.notification.fields.title}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.notification.hints.title ? (
                    <FormDescription>
                      {dictionary.notification.hints.title}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="title-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.notification.fields.body}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.notification.hints.body ? (
                    <FormDescription>
                      {dictionary.notification.hints.body}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="body-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="actionUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.notification.fields.actionUrl}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.notification.hints.actionUrl ? (
                    <FormDescription>
                      {dictionary.notification.hints.actionUrl}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="actionUrl-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{dictionary.notification.fields.scope}</FormLabel>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      className="flex flex-col space-y-1"
                      disabled={mutation.isPending || mutation.isSuccess}
                    >
                      {Object.keys(notificationEnumerators.scope).map(
                        (scope) => (
                          <FormItem
                            key={scope}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={scope} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {enumeratorLabel(
                                dictionary.notification.enumerators.scope,
                                scope,
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

                  {dictionary.notification.hints.scope ? (
                    <FormDescription>
                      {dictionary.notification.hints.scope}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="scope-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="targetUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.notification.fields.targetUserId}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.notification.hints.targetUserId ? (
                    <FormDescription>
                      {dictionary.notification.hints.targetUserId}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="targetUserId-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="targetSegment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.notification.fields.targetSegment}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.notification.hints.targetSegment ? (
                    <FormDescription>
                      {dictionary.notification.hints.targetSegment}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="targetSegment-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="persistent"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={mutation.isPending || mutation.isSuccess}
                      />
                    </FormControl>
                    <FormLabel>
                      {dictionary.notification.fields.persistent}
                    </FormLabel>
                  </div>

                  {dictionary.notification.hints.persistent ? (
                    <FormDescription>
                      {dictionary.notification.hints.persistent}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="persistent-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="dismissible"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={mutation.isPending || mutation.isSuccess}
                      />
                    </FormControl>
                    <FormLabel>
                      {dictionary.notification.fields.dismissible}
                    </FormLabel>
                  </div>

                  {dictionary.notification.hints.dismissible ? (
                    <FormDescription>
                      {dictionary.notification.hints.dismissible}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="dismissible-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="requiresAck"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={mutation.isPending || mutation.isSuccess}
                      />
                    </FormControl>
                    <FormLabel>
                      {dictionary.notification.fields.requiresAck}
                    </FormLabel>
                  </div>

                  {dictionary.notification.hints.requiresAck ? (
                    <FormDescription>
                      {dictionary.notification.hints.requiresAck}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="requiresAck-error" />
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
                    {dictionary.notification.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.notification.hints.meta ? (
                    <FormDescription>
                      {dictionary.notification.hints.meta}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="meta-error" />
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
