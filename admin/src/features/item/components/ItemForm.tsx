import { zodResolver } from '@hookform/resolvers/zod';
import { Item } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { ItemWithRelationships } from 'src/features/item/itemSchemas';
import {
  itemCreateApiCall,
  itemUpdateApiCall,
} from 'src/features/item/itemApiCalls';
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
import { itemCreateInputSchema } from 'src/features/item/itemSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { Textarea } from 'src/shared/components/ui/textarea';
import { ImagesInput } from 'src/features/file/components/ImagesInput';
import { storage } from 'src/features/storage';
import TagsInput from 'src/shared/components/form/TagsInput';
import { FilesInput } from 'src/features/file/components/FilesInput';

export function ItemForm({
  item,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (item: ItemWithRelationships) => void;
  item?: Partial<ItemWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(item?.id);

  const [initialValues] = React.useState({
    name: item?.name || '',
    caption: item?.caption || '',
    description: item?.description || '',
    price: item?.price ? Number(item?.price) : '',
    photos: item?.photos || [],
    category: item?.category || [],
    meta: item?.meta?.toString() || '',
    files: item?.files || [],
  });

  const form = useForm({
    resolver: zodResolver(itemCreateInputSchema),
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
    mutationFn: (data: z.input<typeof itemCreateInputSchema>) => {
      if (item?.id) {
        return itemUpdateApiCall(item.id, data);
      } else {
        return itemCreateApiCall(data);
      }
    },
    onSuccess: (item: Item) => {
      queryClient.invalidateQueries({
        queryKey: ['item'],
      });

      onSuccess(item);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.item.edit.success
          : dictionary.item.new.success,
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.item.fields.name}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
          {...field}
                  />

                  {dictionary.item.hints.name ? (
                    <FormDescription>
                      {dictionary.item.hints.name}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="name-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.item.fields.caption}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.item.hints.caption ? (
                    <FormDescription>
                      {dictionary.item.hints.caption}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="caption-error" />
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
                    {dictionary.item.fields.description}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.item.hints.description ? (
                    <FormDescription>
                      {dictionary.item.hints.description}
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.item.fields.price}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.item.hints.price ? (
                      <FormDescription>
                        {dictionary.item.hints.price}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="price-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="photos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.item.fields.photos}
                  </FormLabel>

                  <div>
                    <ImagesInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      storage={storage.itemPhotos}
                      disabled={mutation.isPending || mutation.isSuccess}
                    />
                  </div>

                  {dictionary.item.hints.photos ? (
                    <FormDescription>
                      {dictionary.item.hints.photos}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="photos-error" />
                </FormItem>
              )}
            />
          </div>
           <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.item.fields.category}</FormLabel>

                  <TagsInput
                    dictionary={dictionary}
                    separator=","
                    disabled={mutation.isPending || mutation.isSuccess}
                    onChange={field.onChange}
                    value={field.value}
                  />

                  {dictionary.item.hints.category ? (
                    <FormDescription>
                      {dictionary.item.hints.category}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="category-error" />
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
                    {dictionary.item.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.item.hints.meta ? (
                    <FormDescription>
                      {dictionary.item.hints.meta}
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
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.item.fields.files}
                  </FormLabel>

                  <div>
                    <FilesInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      storage={storage.itemFiles}
                      disabled={mutation.isPending || mutation.isSuccess}
                    />
                  </div>

                  {dictionary.item.hints.files ? (
                    <FormDescription>
                      {dictionary.item.hints.files}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="files-error" />
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
