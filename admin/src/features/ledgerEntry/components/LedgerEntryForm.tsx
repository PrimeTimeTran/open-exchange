import { zodResolver } from '@hookform/resolvers/zod';
import { LedgerEntry } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { LedgerEntryWithRelationships } from 'src/features/ledgerEntry/ledgerEntrySchemas';
import {
  ledgerEntryCreateApiCall,
  ledgerEntryUpdateApiCall,
} from 'src/features/ledgerEntry/ledgerEntryApiCalls';
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
import { ledgerEntryCreateInputSchema } from 'src/features/ledgerEntry/ledgerEntrySchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { LedgerEventAutocompleteInput } from 'src/features/ledgerEvent/components/LedgerEventAutocompleteInput';

export function LedgerEntryForm({
  ledgerEntry,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (ledgerEntry: LedgerEntryWithRelationships) => void;
  ledgerEntry?: Partial<LedgerEntryWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(ledgerEntry?.id);

  const [initialValues] = React.useState({
    amount: ledgerEntry?.amount ? Number(ledgerEntry?.amount) : '',
    event: ledgerEntry?.event || null,
  });

  const form = useForm({
    resolver: zodResolver(ledgerEntryCreateInputSchema),
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
    mutationFn: (data: z.input<typeof ledgerEntryCreateInputSchema>) => {
      if (ledgerEntry?.id) {
        return ledgerEntryUpdateApiCall(ledgerEntry.id, data);
      } else {
        return ledgerEntryCreateApiCall(data);
      }
    },
    onSuccess: (ledgerEntry: LedgerEntry) => {
      queryClient.invalidateQueries({
        queryKey: ['ledgerEntry'],
      });

      onSuccess(ledgerEntry);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.ledgerEntry.edit.success
          : dictionary.ledgerEntry.new.success,
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.ledgerEntry.fields.amount}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      autoFocus
          {...field}
                    />

                    {dictionary.ledgerEntry.hints.amount ? (
                      <FormDescription>
                        {dictionary.ledgerEntry.hints.amount}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="amount-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="event"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.ledgerEntry.fields.event}</FormLabel>

                  <LedgerEventAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.ledgerEntry.hints.event ? (
                    <FormDescription>
                      {dictionary.ledgerEntry.hints.event}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="event-error" />
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
