import { zodResolver } from '@hookform/resolvers/zod';
import { LedgerEvent } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { LedgerEventWithRelationships } from 'src/features/ledgerEvent/ledgerEventSchemas';
import {
  ledgerEventCreateApiCall,
  ledgerEventUpdateApiCall,
} from 'src/features/ledgerEvent/ledgerEventApiCalls';
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
import { ledgerEventCreateInputSchema } from 'src/features/ledgerEvent/ledgerEventSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { ledgerEventEnumerators } from 'src/features/ledgerEvent/ledgerEventEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import { Input } from 'src/shared/components/ui/input';
import { Textarea } from 'src/shared/components/ui/textarea';

export function LedgerEventForm({
  ledgerEvent,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (ledgerEvent: LedgerEventWithRelationships) => void;
  ledgerEvent?: Partial<LedgerEventWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(ledgerEvent?.id);

  const [initialValues] = React.useState({
    type: ledgerEvent?.type || null,
    referenceId: ledgerEvent?.referenceId || '',
    referenceType: ledgerEvent?.referenceType || null,
    status: ledgerEvent?.status || null,
    description: ledgerEvent?.description || '',
    meta: ledgerEvent?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(ledgerEventCreateInputSchema),
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
    mutationFn: (data: z.input<typeof ledgerEventCreateInputSchema>) => {
      if (ledgerEvent?.id) {
        return ledgerEventUpdateApiCall(ledgerEvent.id, data);
      } else {
        return ledgerEventCreateApiCall(data);
      }
    },
    onSuccess: (ledgerEvent: LedgerEvent) => {
      queryClient.invalidateQueries({
        queryKey: ['ledgerEvent'],
      });

      onSuccess(ledgerEvent);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.ledgerEvent.edit.success
          : dictionary.ledgerEvent.new.success,
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
              <FormItem>
                <FormLabel>{dictionary.ledgerEvent.fields.type}</FormLabel>

                <SelectInput
                  options={Object.keys(ledgerEventEnumerators.type).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.ledgerEvent.enumerators.type,
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

                {dictionary.ledgerEvent.hints.type ? (
                  <FormDescription>
                    {dictionary.ledgerEvent.hints.type}
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
              name="referenceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.ledgerEvent.fields.referenceId}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.ledgerEvent.hints.referenceId ? (
                    <FormDescription>
                      {dictionary.ledgerEvent.hints.referenceId}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="referenceId-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
          <FormField
            control={form.control}
            name="referenceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.ledgerEvent.fields.referenceType}</FormLabel>

                <SelectInput
                  options={Object.keys(ledgerEventEnumerators.referenceType).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.ledgerEvent.enumerators.referenceType,
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

                {dictionary.ledgerEvent.hints.referenceType ? (
                  <FormDescription>
                    {dictionary.ledgerEvent.hints.referenceType}
                  </FormDescription>
                ) : null}

                <FormMessage data-testid="referenceType-error" />
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
                <FormLabel>{dictionary.ledgerEvent.fields.status}</FormLabel>

                <SelectInput
                  options={Object.keys(ledgerEventEnumerators.status).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.ledgerEvent.enumerators.status,
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

                {dictionary.ledgerEvent.hints.status ? (
                  <FormDescription>
                    {dictionary.ledgerEvent.hints.status}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.ledgerEvent.fields.description}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.ledgerEvent.hints.description ? (
                    <FormDescription>
                      {dictionary.ledgerEvent.hints.description}
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
              name="meta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.ledgerEvent.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.ledgerEvent.hints.meta ? (
                    <FormDescription>
                      {dictionary.ledgerEvent.hints.meta}
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
