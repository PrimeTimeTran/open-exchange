import { zodResolver } from '@hookform/resolvers/zod';
import { Message } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { MessageWithRelationships } from 'src/features/message/messageSchemas';
import {
  messageCreateApiCall,
  messageUpdateApiCall,
} from 'src/features/message/messageApiCalls';
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
import { messageCreateInputSchema } from 'src/features/message/messageSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Textarea } from 'src/shared/components/ui/textarea';
import { FilesInput } from 'src/features/file/components/FilesInput';
import { storage } from 'src/features/storage';
import { ImagesInput } from 'src/features/file/components/ImagesInput';
import TagsInput from 'src/shared/components/form/TagsInput';
import { ChatAutocompleteInput } from 'src/features/chat/components/ChatAutocompleteInput';
import { ChateeAutocompleteInput } from 'src/features/chatee/components/ChateeAutocompleteInput';
import { MembershipAutocompleteInput } from 'src/features/membership/components/MembershipAutocompleteInput';

export function MessageForm({
  message,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (message: MessageWithRelationships) => void;
  message?: Partial<MessageWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(message?.id);

  const [initialValues] = React.useState({
    body: message?.body || '',
    attachment: message?.attachment || [],
    images: message?.images || [],
    type: message?.type || [],
    meta: message?.meta?.toString() || '',
    chat: message?.chat || null,
    chatee: message?.chatee || null,
    sender: message?.sender || null,
  });

  const form = useForm({
    resolver: zodResolver(messageCreateInputSchema),
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
    mutationFn: (data: z.input<typeof messageCreateInputSchema>) => {
      if (message?.id) {
        return messageUpdateApiCall(message.id, data);
      } else {
        return messageCreateApiCall(data);
      }
    },
    onSuccess: (message: Message) => {
      queryClient.invalidateQueries({
        queryKey: ['message'],
      });

      onSuccess(message);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.message.edit.success
          : dictionary.message.new.success,
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
                    {dictionary.message.fields.body}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
          {...field}
                  />

                  {dictionary.message.hints.body ? (
                    <FormDescription>
                      {dictionary.message.hints.body}
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
              name="attachment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.message.fields.attachment}
                  </FormLabel>

                  <div>
                    <FilesInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      storage={storage.messageAttachment}
                      disabled={mutation.isPending || mutation.isSuccess}
                    />
                  </div>

                  {dictionary.message.hints.attachment ? (
                    <FormDescription>
                      {dictionary.message.hints.attachment}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="attachment-error" />
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
                    {dictionary.message.fields.images}
                  </FormLabel>

                  <div>
                    <ImagesInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      storage={storage.messageImages}
                      disabled={mutation.isPending || mutation.isSuccess}
                    />
                  </div>

                  {dictionary.message.hints.images ? (
                    <FormDescription>
                      {dictionary.message.hints.images}
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
                  <FormLabel>{dictionary.message.fields.type}</FormLabel>

                  <TagsInput
                    dictionary={dictionary}
                    separator=","
                    disabled={mutation.isPending || mutation.isSuccess}
                    onChange={field.onChange}
                    value={field.value}
                  />

                  {dictionary.message.hints.type ? (
                    <FormDescription>
                      {dictionary.message.hints.type}
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
              name="meta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.message.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.message.hints.meta ? (
                    <FormDescription>
                      {dictionary.message.hints.meta}
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
              name="chat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.message.fields.chat}</FormLabel>

                  <ChatAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.message.hints.chat ? (
                    <FormDescription>
                      {dictionary.message.hints.chat}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="chat-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="chatee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.message.fields.chatee}</FormLabel>

                  <ChateeAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.message.hints.chatee ? (
                    <FormDescription>
                      {dictionary.message.hints.chatee}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="chatee-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="sender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.message.fields.sender}</FormLabel>

                  <MembershipAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.message.hints.sender ? (
                    <FormDescription>
                      {dictionary.message.hints.sender}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="sender-error" />
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
