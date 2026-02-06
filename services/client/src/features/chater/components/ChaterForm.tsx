import { zodResolver } from '@hookform/resolvers/zod';
import { Chater } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { ChaterWithRelationships } from 'src/features/chater/chaterSchemas';
import {
  chaterCreateApiCall,
  chaterUpdateApiCall,
} from 'src/features/chater/chaterApiCalls';
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
import { chaterCreateInputSchema } from 'src/features/chater/chaterSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { chaterEnumerators } from 'src/features/chater/chaterEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import TagsInput from 'src/shared/components/form/TagsInput';
import { Textarea } from 'src/shared/components/ui/textarea';
import { MembershipAutocompleteInput } from 'src/features/membership/components/MembershipAutocompleteInput';
import { ChatAutocompleteInput } from 'src/features/chat/components/ChatAutocompleteInput';

export function ChaterForm({
  chater,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (chater: ChaterWithRelationships) => void;
  chater?: Partial<ChaterWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(chater?.id);

  const [initialValues] = React.useState({
    nickname: chater?.nickname || '',
    status: chater?.status || null,
    role: chater?.role || [],
    meta: chater?.meta?.toString() || '',
    user: chater?.user || null,
    chat: chater?.chat || null,
  });

  const form = useForm({
    resolver: zodResolver(chaterCreateInputSchema),
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
    mutationFn: (data: z.input<typeof chaterCreateInputSchema>) => {
      if (chater?.id) {
        return chaterUpdateApiCall(chater.id, data);
      } else {
        return chaterCreateApiCall(data);
      }
    },
    onSuccess: (chater: Chater) => {
      queryClient.invalidateQueries({
        queryKey: ['chater'],
      });

      onSuccess(chater);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.chater.edit.success
          : dictionary.chater.new.success,
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
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.chater.fields.nickname}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
          {...field}
                  />

                  {dictionary.chater.hints.nickname ? (
                    <FormDescription>
                      {dictionary.chater.hints.nickname}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="nickname-error" />
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
                <FormLabel>{dictionary.chater.fields.status}</FormLabel>

                <SelectInput
                  options={Object.keys(chaterEnumerators.status).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.chater.enumerators.status,
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

                {dictionary.chater.hints.status ? (
                  <FormDescription>
                    {dictionary.chater.hints.status}
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.chater.fields.role}</FormLabel>

                  <TagsInput
                    dictionary={dictionary}
                    separator=","
                    disabled={mutation.isPending || mutation.isSuccess}
                    onChange={field.onChange}
                    value={field.value}
                  />

                  {dictionary.chater.hints.role ? (
                    <FormDescription>
                      {dictionary.chater.hints.role}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="role-error" />
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
                    {dictionary.chater.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.chater.hints.meta ? (
                    <FormDescription>
                      {dictionary.chater.hints.meta}
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
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.chater.fields.user}</FormLabel>

                  <MembershipAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.chater.hints.user ? (
                    <FormDescription>
                      {dictionary.chater.hints.user}
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
              name="chat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.chater.fields.chat}</FormLabel>

                  <ChatAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.chater.hints.chat ? (
                    <FormDescription>
                      {dictionary.chater.hints.chat}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="chat-error" />
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
