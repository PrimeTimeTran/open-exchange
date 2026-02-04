import { zodResolver } from '@hookform/resolvers/zod';
import { Feedback } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { FeedbackWithRelationships } from 'src/features/feedback/feedbackSchemas';
import {
  feedbackCreateApiCall,
  feedbackUpdateApiCall,
} from 'src/features/feedback/feedbackApiCalls';
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
import { feedbackCreateInputSchema } from 'src/features/feedback/feedbackSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { FilesInput } from 'src/features/file/components/FilesInput';
import { storage } from 'src/features/storage';
import { feedbackEnumerators } from 'src/features/feedback/feedbackEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import { Textarea } from 'src/shared/components/ui/textarea';
import { MembershipAutocompleteInput } from 'src/features/membership/components/MembershipAutocompleteInput';

export function FeedbackForm({
  feedback,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (feedback: FeedbackWithRelationships) => void;
  feedback?: Partial<FeedbackWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(feedback?.id);

  const [initialValues] = React.useState({
    title: feedback?.title || '',
    description: feedback?.description || '',
    attachments: feedback?.attachments || [],
    type: feedback?.type || null,
    status: feedback?.status || null,
    user: feedback?.user || null,
    json: feedback?.json?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(feedbackCreateInputSchema),
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
    mutationFn: (data: z.input<typeof feedbackCreateInputSchema>) => {
      if (feedback?.id) {
        return feedbackUpdateApiCall(feedback.id, data);
      } else {
        return feedbackCreateApiCall(data);
      }
    },
    onSuccess: (feedback: Feedback) => {
      queryClient.invalidateQueries({
        queryKey: ['feedback'],
      });

      onSuccess(feedback);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.feedback.edit.success
          : dictionary.feedback.new.success,
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.feedback.fields.title}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
          {...field}
                  />

                  {dictionary.feedback.hints.title ? (
                    <FormDescription>
                      {dictionary.feedback.hints.title}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.feedback.fields.description}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.feedback.hints.description ? (
                    <FormDescription>
                      {dictionary.feedback.hints.description}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="description-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.feedback.fields.attachments}
                  </FormLabel>

                  <div>
                    <FilesInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      storage={storage.feedbackAttachments}
                      disabled={mutation.isPending || mutation.isSuccess}
                    />
                  </div>

                  {dictionary.feedback.hints.attachments ? (
                    <FormDescription>
                      {dictionary.feedback.hints.attachments}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="attachments-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.feedback.fields.type}</FormLabel>

                <SelectInput
                  options={Object.keys(feedbackEnumerators.type).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.feedback.enumerators.type,
                        value,
                      ),
                    }),
                  )}
                  dictionary={dictionary}
                  isClearable={true}
                  disabled={mutation.isPending || mutation.isSuccess}
                  onChange={field.onChange}
                  value={field.value}
                />

                {dictionary.feedback.hints.type ? (
                  <FormDescription>
                    {dictionary.feedback.hints.type}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.feedback.fields.status}</FormLabel>

                <SelectInput
                  options={Object.keys(feedbackEnumerators.status).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.feedback.enumerators.status,
                        value,
                      ),
                    }),
                  )}
                  dictionary={dictionary}
                  isClearable={true}
                  disabled={mutation.isPending || mutation.isSuccess}
                  onChange={field.onChange}
                  value={field.value}
                />

                {dictionary.feedback.hints.status ? (
                  <FormDescription>
                    {dictionary.feedback.hints.status}
                  </FormDescription>
                ) : null}

                <FormMessage data-testid="status-error" />
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
                  <FormLabel>{dictionary.feedback.fields.user}</FormLabel>

                  <MembershipAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.feedback.hints.user ? (
                    <FormDescription>
                      {dictionary.feedback.hints.user}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="user-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="json"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.feedback.fields.json}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.feedback.hints.json ? (
                    <FormDescription>
                      {dictionary.feedback.hints.json}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="json-error" />
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
