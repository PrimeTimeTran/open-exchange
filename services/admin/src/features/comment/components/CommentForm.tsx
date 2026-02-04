import { zodResolver } from '@hookform/resolvers/zod';
import { Comment } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { CommentWithRelationships } from 'src/features/comment/commentSchemas';
import {
  commentCreateApiCall,
  commentUpdateApiCall,
} from 'src/features/comment/commentApiCalls';
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
import { commentCreateInputSchema } from 'src/features/comment/commentSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Textarea } from 'src/shared/components/ui/textarea';
import TagsInput from 'src/shared/components/form/TagsInput';
import { ImagesInput } from 'src/features/file/components/ImagesInput';
import { storage } from 'src/features/storage';
import { MembershipAutocompleteInput } from 'src/features/membership/components/MembershipAutocompleteInput';

export function CommentForm({
  comment,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (comment: CommentWithRelationships) => void;
  comment?: Partial<CommentWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(comment?.id);

  const [initialValues] = React.useState({
    body: comment?.body || '',
    type: comment?.type || [],
    images: comment?.images || [],
    user: comment?.user || null,
    meta: comment?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(commentCreateInputSchema),
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
    mutationFn: (data: z.input<typeof commentCreateInputSchema>) => {
      if (comment?.id) {
        return commentUpdateApiCall(comment.id, data);
      } else {
        return commentCreateApiCall(data);
      }
    },
    onSuccess: (comment: Comment) => {
      queryClient.invalidateQueries({
        queryKey: ['comment'],
      });

      onSuccess(comment);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.comment.edit.success
          : dictionary.comment.new.success,
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
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.comment.fields.body}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
          {...field}
                  />

                  {dictionary.comment.hints.body ? (
                    <FormDescription>
                      {dictionary.comment.hints.body}
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.comment.fields.type}</FormLabel>

                  <TagsInput
                    dictionary={dictionary}
                    separator=","
                    disabled={mutation.isPending || mutation.isSuccess}
                    onChange={field.onChange}
                    value={field.value}
                  />

                  {dictionary.comment.hints.type ? (
                    <FormDescription>
                      {dictionary.comment.hints.type}
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
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.comment.fields.images}
                  </FormLabel>

                  <div>
                    <ImagesInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      storage={storage.commentImages}
                      disabled={mutation.isPending || mutation.isSuccess}
                    />
                  </div>

                  {dictionary.comment.hints.images ? (
                    <FormDescription>
                      {dictionary.comment.hints.images}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="images-error" />
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
                  <FormLabel className="required">{dictionary.comment.fields.user}</FormLabel>

                  <MembershipAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.comment.hints.user ? (
                    <FormDescription>
                      {dictionary.comment.hints.user}
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
              name="meta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.comment.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.comment.hints.meta ? (
                    <FormDescription>
                      {dictionary.comment.hints.meta}
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
