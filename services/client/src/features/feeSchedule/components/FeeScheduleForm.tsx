import { zodResolver } from '@hookform/resolvers/zod';
import { FeeSchedule } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { FeeScheduleWithRelationships } from 'src/features/feeSchedule/feeScheduleSchemas';
import {
  feeScheduleCreateApiCall,
  feeScheduleUpdateApiCall,
} from 'src/features/feeSchedule/feeScheduleApiCalls';
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
import { feeScheduleCreateInputSchema } from 'src/features/feeSchedule/feeScheduleSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { feeScheduleEnumerators } from 'src/features/feeSchedule/feeScheduleEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import { Input } from 'src/shared/components/ui/input';
import DateTimePickerInput from 'src/shared/components/form/DateTimePickerInput';
import { Textarea } from 'src/shared/components/ui/textarea';

export function FeeScheduleForm({
  feeSchedule,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (feeSchedule: FeeScheduleWithRelationships) => void;
  feeSchedule?: Partial<FeeScheduleWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(feeSchedule?.id);

  const [initialValues] = React.useState({
    scope: feeSchedule?.scope || null,
    makerFeeBps: feeSchedule?.makerFeeBps || '',
    takerFeeBps: feeSchedule?.takerFeeBps || '',
    minFeeAmount: feeSchedule?.minFeeAmount ? Number(feeSchedule?.minFeeAmount) : '',
    effectiveFrom: feeSchedule?.effectiveFrom || '',
    effectiveTo: feeSchedule?.effectiveTo || '',
    tier: feeSchedule?.tier || '',
    accountId: feeSchedule?.accountId || '',
    instrumentId: feeSchedule?.instrumentId || '',
    meta: feeSchedule?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(feeScheduleCreateInputSchema),
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
    mutationFn: (data: z.input<typeof feeScheduleCreateInputSchema>) => {
      if (feeSchedule?.id) {
        return feeScheduleUpdateApiCall(feeSchedule.id, data);
      } else {
        return feeScheduleCreateApiCall(data);
      }
    },
    onSuccess: (feeSchedule: FeeSchedule) => {
      queryClient.invalidateQueries({
        queryKey: ['feeSchedule'],
      });

      onSuccess(feeSchedule);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.feeSchedule.edit.success
          : dictionary.feeSchedule.new.success,
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
            name="scope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.feeSchedule.fields.scope}</FormLabel>

                <SelectInput
                  options={Object.keys(feeScheduleEnumerators.scope).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.feeSchedule.enumerators.scope,
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

                {dictionary.feeSchedule.hints.scope ? (
                  <FormDescription>
                    {dictionary.feeSchedule.hints.scope}
                  </FormDescription>
                ) : null}

                <FormMessage data-testid="scope-error" />
              </FormItem>
            )}
          />
          </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="makerFeeBps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.feeSchedule.fields.makerFeeBps}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.feeSchedule.hints.makerFeeBps ? (
                      <FormDescription>
                        {dictionary.feeSchedule.hints.makerFeeBps}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="makerFeeBps-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="takerFeeBps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.feeSchedule.fields.takerFeeBps}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.feeSchedule.hints.takerFeeBps ? (
                      <FormDescription>
                        {dictionary.feeSchedule.hints.takerFeeBps}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="takerFeeBps-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="minFeeAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.feeSchedule.fields.minFeeAmount}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.feeSchedule.hints.minFeeAmount ? (
                      <FormDescription>
                        {dictionary.feeSchedule.hints.minFeeAmount}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="minFeeAmount-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="effectiveFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.feeSchedule.fields.effectiveFrom}
                  </FormLabel>

                  <div>
                    <DateTimePickerInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      disabled={mutation.isPending || mutation.isSuccess}
                      isClearable={true}
                    />
                  </div>

                  {dictionary.feeSchedule.hints.effectiveFrom ? (
                    <FormDescription>
                      {dictionary.feeSchedule.hints.effectiveFrom}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="effectiveFrom-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="effectiveTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.feeSchedule.fields.effectiveTo}
                  </FormLabel>

                  <div>
                    <DateTimePickerInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      disabled={mutation.isPending || mutation.isSuccess}
                      isClearable={true}
                    />
                  </div>

                  {dictionary.feeSchedule.hints.effectiveTo ? (
                    <FormDescription>
                      {dictionary.feeSchedule.hints.effectiveTo}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="effectiveTo-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="tier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.feeSchedule.fields.tier}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.feeSchedule.hints.tier ? (
                    <FormDescription>
                      {dictionary.feeSchedule.hints.tier}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="tier-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.feeSchedule.fields.accountId}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.feeSchedule.hints.accountId ? (
                    <FormDescription>
                      {dictionary.feeSchedule.hints.accountId}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="accountId-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="instrumentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.feeSchedule.fields.instrumentId}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.feeSchedule.hints.instrumentId ? (
                    <FormDescription>
                      {dictionary.feeSchedule.hints.instrumentId}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="instrumentId-error" />
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
                    {dictionary.feeSchedule.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.feeSchedule.hints.meta ? (
                    <FormDescription>
                      {dictionary.feeSchedule.hints.meta}
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
