import { zodResolver } from '@hookform/resolvers/zod';
import { Referral } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { ReferralWithRelationships } from 'src/features/referral/referralSchemas';
import {
  referralCreateApiCall,
  referralUpdateApiCall,
} from 'src/features/referral/referralApiCalls';
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
import { referralCreateInputSchema } from 'src/features/referral/referralSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { referralEnumerators } from 'src/features/referral/referralEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import { RadioGroup, RadioGroupItem } from 'src/shared/components/ui/radio-group';
import DateTimePickerInput from 'src/shared/components/form/DateTimePickerInput';
import { Textarea } from 'src/shared/components/ui/textarea';

export function ReferralForm({
  referral,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (referral: ReferralWithRelationships) => void;
  referral?: Partial<ReferralWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(referral?.id);

  const [initialValues] = React.useState({
    referrerUserId: referral?.referrerUserId || '',
    referredUserId: referral?.referredUserId || '',
    referralCode: referral?.referralCode || '',
    source: referral?.source || null,
    status: referral?.status || null,
    rewardType: referral?.rewardType || null,
    rewardAmount: referral?.rewardAmount || '',
    rewardCurrency: referral?.rewardCurrency || '',
    rewardedAt: referral?.rewardedAt || '',
    meta: referral?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(referralCreateInputSchema),
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
    mutationFn: (data: z.input<typeof referralCreateInputSchema>) => {
      if (referral?.id) {
        return referralUpdateApiCall(referral.id, data);
      } else {
        return referralCreateApiCall(data);
      }
    },
    onSuccess: (referral: Referral) => {
      queryClient.invalidateQueries({
        queryKey: ['referral'],
      });

      onSuccess(referral);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.referral.edit.success
          : dictionary.referral.new.success,
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
              name="referrerUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.referral.fields.referrerUserId}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
          {...field}
                  />

                  {dictionary.referral.hints.referrerUserId ? (
                    <FormDescription>
                      {dictionary.referral.hints.referrerUserId}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="referrerUserId-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="referredUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.referral.fields.referredUserId}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.referral.hints.referredUserId ? (
                    <FormDescription>
                      {dictionary.referral.hints.referredUserId}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="referredUserId-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="referralCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.referral.fields.referralCode}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.referral.hints.referralCode ? (
                    <FormDescription>
                      {dictionary.referral.hints.referralCode}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="referralCode-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.referral.fields.source}</FormLabel>

                <SelectInput
                  options={Object.keys(referralEnumerators.source).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.referral.enumerators.source,
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

                {dictionary.referral.hints.source ? (
                  <FormDescription>
                    {dictionary.referral.hints.source}
                  </FormDescription>
                ) : null}

                <FormMessage data-testid="source-error" />
              </FormItem>
            )}
          />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{dictionary.referral.fields.status}</FormLabel>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      className="flex flex-col space-y-1"
                      disabled={mutation.isPending || mutation.isSuccess}
                    >
                      {Object.keys(referralEnumerators.status).map(
                        (status) => (
                          <FormItem
                            key={status}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={status} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {enumeratorLabel(
                                dictionary.referral.enumerators.status,
                                status,
                              )}
                            </FormLabel>
                          </FormItem>
                        ),
                      )}
                    </RadioGroup>
                  </FormControl>

                  {Boolean(field.value) && (
                    <button
                      type="button"
                      className="mt-2 text-sm text-muted-foreground underline"
                      onClick={() => field.onChange(null)}
                    >
                      {dictionary.shared.clear}
                    </button>
                  )}

                  {dictionary.referral.hints.status ? (
                    <FormDescription>
                      {dictionary.referral.hints.status}
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
              name="rewardType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{dictionary.referral.fields.rewardType}</FormLabel>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      className="flex flex-col space-y-1"
                      disabled={mutation.isPending || mutation.isSuccess}
                    >
                      {Object.keys(referralEnumerators.rewardType).map(
                        (rewardType) => (
                          <FormItem
                            key={rewardType}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={rewardType} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {enumeratorLabel(
                                dictionary.referral.enumerators.rewardType,
                                rewardType,
                              )}
                            </FormLabel>
                          </FormItem>
                        ),
                      )}
                    </RadioGroup>
                  </FormControl>

                  {Boolean(field.value) && (
                    <button
                      type="button"
                      className="mt-2 text-sm text-muted-foreground underline"
                      onClick={() => field.onChange(null)}
                    >
                      {dictionary.shared.clear}
                    </button>
                  )}

                  {dictionary.referral.hints.rewardType ? (
                    <FormDescription>
                      {dictionary.referral.hints.rewardType}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="rewardType-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="rewardAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.referral.fields.rewardAmount}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.referral.hints.rewardAmount ? (
                      <FormDescription>
                        {dictionary.referral.hints.rewardAmount}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="rewardAmount-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="rewardCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.referral.fields.rewardCurrency}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.referral.hints.rewardCurrency ? (
                    <FormDescription>
                      {dictionary.referral.hints.rewardCurrency}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="rewardCurrency-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="rewardedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.referral.fields.rewardedAt}
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

                  {dictionary.referral.hints.rewardedAt ? (
                    <FormDescription>
                      {dictionary.referral.hints.rewardedAt}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="rewardedAt-error" />
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
                    {dictionary.referral.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.referral.hints.meta ? (
                    <FormDescription>
                      {dictionary.referral.hints.meta}
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
