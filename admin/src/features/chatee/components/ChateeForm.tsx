import { zodResolver } from '@hookform/resolvers/zod';
import { Chatee } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { ChateeWithRelationships } from 'src/features/chatee/chateeSchemas';
import {
  chateeCreateApiCall,
  chateeUpdateApiCall,
} from 'src/features/chatee/chateeApiCalls';
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
import { chateeCreateInputSchema } from 'src/features/chatee/chateeSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { chateeEnumerators } from 'src/features/chatee/chateeEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import TagsInput from 'src/shared/components/form/TagsInput';
import { MembershipAutocompleteInput } from 'src/features/membership/components/MembershipAutocompleteInput';
import { ChatAutocompleteInput } from 'src/features/chat/components/ChatAutocompleteInput';

export function ChateeForm({
  chatee,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (chatee: ChateeWithRelationships) => void;
  chatee?: Partial<ChateeWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(chatee?.id);

  const [initialValues] = React.useState({
    nickname: chatee?.nickname || '',
    status: chatee?.status || null,
    role: chatee?.role || [],
    user: chatee?.user || null,
    chat: chatee?.chat || null,
  });

  const form = useForm({
    resolver: zodResolver(chateeCreateInputSchema),
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
    mutationFn: (data: z.input<typeof chateeCreateInputSchema>) => {
      if (chatee?.id) {
        return chateeUpdateApiCall(chatee.id, data);
      } else {
        return chateeCreateApiCall(data);
      }
    },
    onSuccess: (chatee: Chatee) => {
      queryClient.invalidateQueries({
        queryKey: ['chatee'],
      });

      onSuccess(chatee);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.chatee.edit.success
          : dictionary.chatee.new.success,
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
                    {dictionary.chatee.fields.nickname}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
          {...field}
                  />

                  {dictionary.chatee.hints.nickname ? (
                    <FormDescription>
                      {dictionary.chatee.hints.nickname}
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
                <FormLabel>{dictionary.chatee.fields.status}</FormLabel>

                <SelectInput
                  options={Object.keys(chateeEnumerators.status).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.chatee.enumerators.status,
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

                {dictionary.chatee.hints.status ? (
                  <FormDescription>
                    {dictionary.chatee.hints.status}
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
                  <FormLabel>{dictionary.chatee.fields.role}</FormLabel>

                  <TagsInput
                    dictionary={dictionary}
                    separator=","
                    disabled={mutation.isPending || mutation.isSuccess}
                    onChange={field.onChange}
                    value={field.value}
                  />

                  {dictionary.chatee.hints.role ? (
                    <FormDescription>
                      {dictionary.chatee.hints.role}
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
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.chatee.fields.user}</FormLabel>

                  <MembershipAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.chatee.hints.user ? (
                    <FormDescription>
                      {dictionary.chatee.hints.user}
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
                  <FormLabel>{dictionary.chatee.fields.chat}</FormLabel>

                  <ChatAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.chatee.hints.chat ? (
                    <FormDescription>
                      {dictionary.chatee.hints.chat}
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
