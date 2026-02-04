import { zodResolver } from '@hookform/resolvers/zod';
import { Article } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { ArticleWithRelationships } from 'src/features/article/articleSchemas';
import {
  articleCreateApiCall,
  articleUpdateApiCall,
} from 'src/features/article/articleApiCalls';
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
import { articleCreateInputSchema } from 'src/features/article/articleSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { Textarea } from 'src/shared/components/ui/textarea';
import TagsInput from 'src/shared/components/form/TagsInput';
import { ImagesInput } from 'src/features/file/components/ImagesInput';
import { storage } from 'src/features/storage';
import { FilesInput } from 'src/features/file/components/FilesInput';
import { MembershipAutocompleteInput } from 'src/features/membership/components/MembershipAutocompleteInput';

export function ArticleForm({
  article,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (article: ArticleWithRelationships) => void;
  article?: Partial<ArticleWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(article?.id);

  const [initialValues] = React.useState({
    user: article?.user || null,
    title: article?.title || '',
    body: article?.body || '',
    type: article?.type || [],
    images: article?.images || [],
    files: article?.files || [],
    meta: article?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(articleCreateInputSchema),
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
    mutationFn: (data: z.input<typeof articleCreateInputSchema>) => {
      if (article?.id) {
        return articleUpdateApiCall(article.id, data);
      } else {
        return articleCreateApiCall(data);
      }
    },
    onSuccess: (article: Article) => {
      queryClient.invalidateQueries({
        queryKey: ['article'],
      });

      onSuccess(article);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.article.edit.success
          : dictionary.article.new.success,
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
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.article.fields.user}</FormLabel>

                  <MembershipAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.article.hints.user ? (
                    <FormDescription>
                      {dictionary.article.hints.user}
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.article.fields.title}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.article.hints.title ? (
                    <FormDescription>
                      {dictionary.article.hints.title}
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
                    {dictionary.article.fields.body}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.article.hints.body ? (
                    <FormDescription>
                      {dictionary.article.hints.body}
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
                  <FormLabel>{dictionary.article.fields.type}</FormLabel>

                  <TagsInput
                    dictionary={dictionary}
                    separator=","
                    disabled={mutation.isPending || mutation.isSuccess}
                    onChange={field.onChange}
                    value={field.value}
                  />

                  {dictionary.article.hints.type ? (
                    <FormDescription>
                      {dictionary.article.hints.type}
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
                    {dictionary.article.fields.images}
                  </FormLabel>

                  <div>
                    <ImagesInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      storage={storage.articleImages}
                      disabled={mutation.isPending || mutation.isSuccess}
                    />
                  </div>

                  {dictionary.article.hints.images ? (
                    <FormDescription>
                      {dictionary.article.hints.images}
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
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.article.fields.files}
                  </FormLabel>

                  <div>
                    <FilesInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      storage={storage.articleFiles}
                      disabled={mutation.isPending || mutation.isSuccess}
                    />
                  </div>

                  {dictionary.article.hints.files ? (
                    <FormDescription>
                      {dictionary.article.hints.files}
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
              name="meta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.article.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.article.hints.meta ? (
                    <FormDescription>
                      {dictionary.article.hints.meta}
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
