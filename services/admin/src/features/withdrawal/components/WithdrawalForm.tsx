import { zodResolver } from '@hookform/resolvers/zod';
import { Withdrawal } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { WithdrawalWithRelationships } from 'src/features/withdrawal/withdrawalSchemas';
import {
  withdrawalCreateApiCall,
  withdrawalUpdateApiCall,
} from 'src/features/withdrawal/withdrawalApiCalls';
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
import { withdrawalCreateInputSchema } from 'src/features/withdrawal/withdrawalSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { withdrawalEnumerators } from 'src/features/withdrawal/withdrawalEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import DateTimePickerInput from 'src/shared/components/form/DateTimePickerInput';
import { Textarea } from 'src/shared/components/ui/textarea';
import { AccountAutocompleteInput } from 'src/features/account/components/AccountAutocompleteInput';
import { AssetAutocompleteInput } from 'src/features/asset/components/AssetAutocompleteInput';

export function WithdrawalForm({
  withdrawal,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (withdrawal: WithdrawalWithRelationships) => void;
  withdrawal?: Partial<WithdrawalWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(withdrawal?.id);

  const [initialValues] = React.useState({
    amount: withdrawal?.amount || '',
    fee: withdrawal?.fee || '',
    status: withdrawal?.status || null,
    destinationAddress: withdrawal?.destinationAddress || '',
    destinationTag: withdrawal?.destinationTag || '',
    chain: withdrawal?.chain || '',
    txHash: withdrawal?.txHash || '',
    failureReason: withdrawal?.failureReason || '',
    requestedBy: withdrawal?.requestedBy || '',
    approvedBy: withdrawal?.approvedBy || '',
    approvedAt: withdrawal?.approvedAt || '',
    requestedAt: withdrawal?.requestedAt || '',
    broadcastAt: withdrawal?.broadcastAt || '',
    confirmedAt: withdrawal?.confirmedAt || '',
    confirmations: withdrawal?.confirmations || '',
    account: withdrawal?.account || null,
    meta: withdrawal?.meta?.toString() || '',
    asset: withdrawal?.asset || null,
  });

  const form = useForm({
    resolver: zodResolver(withdrawalCreateInputSchema),
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
    mutationFn: (data: z.input<typeof withdrawalCreateInputSchema>) => {
      if (withdrawal?.id) {
        return withdrawalUpdateApiCall(withdrawal.id, data);
      } else {
        return withdrawalCreateApiCall(data);
      }
    },
    onSuccess: (withdrawal: Withdrawal) => {
      queryClient.invalidateQueries({
        queryKey: ['withdrawal'],
      });

      onSuccess(withdrawal);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.withdrawal.edit.success
          : dictionary.withdrawal.new.success,
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
                      {dictionary.withdrawal.fields.amount}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      autoFocus
          {...field}
                    />

                    {dictionary.withdrawal.hints.amount ? (
                      <FormDescription>
                        {dictionary.withdrawal.hints.amount}
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
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.withdrawal.fields.fee}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.withdrawal.hints.fee ? (
                      <FormDescription>
                        {dictionary.withdrawal.hints.fee}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="fee-error" />
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
                <FormLabel>{dictionary.withdrawal.fields.status}</FormLabel>

                <SelectInput
                  options={Object.keys(withdrawalEnumerators.status).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.withdrawal.enumerators.status,
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

                {dictionary.withdrawal.hints.status ? (
                  <FormDescription>
                    {dictionary.withdrawal.hints.status}
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
              name="destinationAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.withdrawal.fields.destinationAddress}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.withdrawal.hints.destinationAddress ? (
                    <FormDescription>
                      {dictionary.withdrawal.hints.destinationAddress}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="destinationAddress-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="destinationTag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.withdrawal.fields.destinationTag}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.withdrawal.hints.destinationTag ? (
                    <FormDescription>
                      {dictionary.withdrawal.hints.destinationTag}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="destinationTag-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="chain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.withdrawal.fields.chain}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.withdrawal.hints.chain ? (
                    <FormDescription>
                      {dictionary.withdrawal.hints.chain}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="chain-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="txHash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.withdrawal.fields.txHash}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.withdrawal.hints.txHash ? (
                    <FormDescription>
                      {dictionary.withdrawal.hints.txHash}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="txHash-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="failureReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.withdrawal.fields.failureReason}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.withdrawal.hints.failureReason ? (
                    <FormDescription>
                      {dictionary.withdrawal.hints.failureReason}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="failureReason-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="requestedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.withdrawal.fields.requestedBy}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.withdrawal.hints.requestedBy ? (
                    <FormDescription>
                      {dictionary.withdrawal.hints.requestedBy}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="requestedBy-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="approvedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.withdrawal.fields.approvedBy}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.withdrawal.hints.approvedBy ? (
                    <FormDescription>
                      {dictionary.withdrawal.hints.approvedBy}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="approvedBy-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="approvedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.withdrawal.fields.approvedAt}
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

                  {dictionary.withdrawal.hints.approvedAt ? (
                    <FormDescription>
                      {dictionary.withdrawal.hints.approvedAt}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="approvedAt-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="requestedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.withdrawal.fields.requestedAt}
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

                  {dictionary.withdrawal.hints.requestedAt ? (
                    <FormDescription>
                      {dictionary.withdrawal.hints.requestedAt}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="requestedAt-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="broadcastAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.withdrawal.fields.broadcastAt}
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

                  {dictionary.withdrawal.hints.broadcastAt ? (
                    <FormDescription>
                      {dictionary.withdrawal.hints.broadcastAt}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="broadcastAt-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="confirmedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.withdrawal.fields.confirmedAt}
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

                  {dictionary.withdrawal.hints.confirmedAt ? (
                    <FormDescription>
                      {dictionary.withdrawal.hints.confirmedAt}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="confirmedAt-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="confirmations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.withdrawal.fields.confirmations}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.withdrawal.hints.confirmations ? (
                      <FormDescription>
                        {dictionary.withdrawal.hints.confirmations}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="confirmations-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.withdrawal.fields.account}</FormLabel>

                  <AccountAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.withdrawal.hints.account ? (
                    <FormDescription>
                      {dictionary.withdrawal.hints.account}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="account-error" />
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
                    {dictionary.withdrawal.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.withdrawal.hints.meta ? (
                    <FormDescription>
                      {dictionary.withdrawal.hints.meta}
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
              name="asset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.withdrawal.fields.asset}</FormLabel>

                  <AssetAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.withdrawal.hints.asset ? (
                    <FormDescription>
                      {dictionary.withdrawal.hints.asset}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="asset-error" />
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
