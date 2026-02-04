import { zodResolver } from '@hookform/resolvers/zod';
import { Post } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { PostWithRelationships } from 'src/features/post/postSchemas';
import {
  postCreateApiCall,
  postUpdateApiCall,
} from 'src/features/post/postApiCalls';
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
import { postCreateInputSchema } from 'src/features/post/postSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { Textarea } from 'src/shared/components/ui/textarea';
import { FilesInput } from 'src/features/file/components/FilesInput';
import { storage } from 'src/features/storage';
import { ImagesInput } from 'src/features/file/components/ImagesInput';
import TagsInput from 'src/shared/components/form/TagsInput';
import { MembershipAutocompleteInput } from 'src/features/membership/components/MembershipAutocompleteInput';

export function PostForm({
  post,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (post: PostWithRelationships) => void;
  post?: Partial<PostWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(post?.id);

  const [initialValues] = React.useState({
    title: post?.title || '',
    body: post?.body || '',
    files: post?.files || [],
    images: post?.images || [],
    type: post?.type || [],
    user: post?.user || null,
    meta: post?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(postCreateInputSchema),
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
    mutationFn: (data: z.input<typeof postCreateInputSchema>) => {
      if (post?.id) {
        return postUpdateApiCall(post.id, data);
      } else {
        return postCreateApiCall(data);
      }
    },
    onSuccess: (post: Post) => {
      queryClient.invalidateQueries({
        queryKey: ['post'],
      });

      onSuccess(post);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.post.edit.success
          : dictionary.post.new.success,
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
                    {dictionary.post.fields.title}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
          {...field}
                  />

                  {dictionary.post.hints.title ? (
                    <FormDescription>
                      {dictionary.post.hints.title}
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
                    {dictionary.post.fields.body}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.post.hints.body ? (
                    <FormDescription>
                      {dictionary.post.hints.body}
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
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.post.fields.files}
                  </FormLabel>

                  <div>
                    <FilesInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      storage={storage.postFiles}
                      disabled={mutation.isPending || mutation.isSuccess}
                    />
                  </div>

                  {dictionary.post.hints.files ? (
                    <FormDescription>
                      {dictionary.post.hints.files}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="files-error" />
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
                    {dictionary.post.fields.images}
                  </FormLabel>

                  <div>
                    <ImagesInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      storage={storage.postImages}
                      disabled={mutation.isPending || mutation.isSuccess}
                    />
                  </div>

                  {dictionary.post.hints.images ? (
                    <FormDescription>
                      {dictionary.post.hints.images}
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.post.fields.type}</FormLabel>

                  <TagsInput
                    dictionary={dictionary}
                    separator=","
                    disabled={mutation.isPending || mutation.isSuccess}
                    onChange={field.onChange}
                    value={field.value}
                  />

                  {dictionary.post.hints.type ? (
                    <FormDescription>
                      {dictionary.post.hints.type}
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
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">{dictionary.post.fields.user}</FormLabel>

                  <MembershipAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.post.hints.user ? (
                    <FormDescription>
                      {dictionary.post.hints.user}
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
                    {dictionary.post.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.post.hints.meta ? (
                    <FormDescription>
                      {dictionary.post.hints.meta}
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
