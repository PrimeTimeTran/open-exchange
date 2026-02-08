import { zodResolver } from '@hookform/resolvers/zod';
import { Deposit } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { DepositWithRelationships } from 'src/features/deposit/depositSchemas';
import {
  depositCreateApiCall,
  depositUpdateApiCall,
} from 'src/features/deposit/depositApiCalls';
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
import { depositCreateInputSchema } from 'src/features/deposit/depositSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { depositEnumerators } from 'src/features/deposit/depositEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import DateTimePickerInput from 'src/shared/components/form/DateTimePickerInput';
import { Textarea } from 'src/shared/components/ui/textarea';
import { AccountAutocompleteInput } from 'src/features/account/components/AccountAutocompleteInput';
import { AssetAutocompleteInput } from 'src/features/asset/components/AssetAutocompleteInput';

export function DepositForm({
  deposit,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (deposit: DepositWithRelationships) => void;
  deposit?: Partial<DepositWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(deposit?.id);

  const [initialValues] = React.useState({
    amount: deposit?.amount ? Number(deposit?.amount) : '',
    status: deposit?.status || null,
    chain: deposit?.chain || '',
    txHash: deposit?.txHash || '',
    fromAddress: deposit?.fromAddress || '',
    confirmations: deposit?.confirmations || '',
    requiredConfirmations: deposit?.requiredConfirmations || '',
    detectedAt: deposit?.detectedAt || '',
    confirmedAt: deposit?.confirmedAt || '',
    creditedAt: deposit?.creditedAt || '',
    account: deposit?.account || null,
    asset: deposit?.asset || null,
    meta: deposit?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(depositCreateInputSchema),
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
    mutationFn: (data: z.input<typeof depositCreateInputSchema>) => {
      if (deposit?.id) {
        return depositUpdateApiCall(deposit.id, data);
      } else {
        return depositCreateApiCall(data);
      }
    },
    onSuccess: (deposit: Deposit) => {
      queryClient.invalidateQueries({
        queryKey: ['deposit'],
      });

      onSuccess(deposit);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.deposit.edit.success
          : dictionary.deposit.new.success,
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
                    <FormLabel className="required">
                      {dictionary.deposit.fields.amount}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      autoFocus
          {...field}
                    />

                    {dictionary.deposit.hints.amount ? (
                      <FormDescription>
                        {dictionary.deposit.hints.amount}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.deposit.fields.status}</FormLabel>

                <SelectInput
                  options={Object.keys(depositEnumerators.status).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.deposit.enumerators.status,
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

                {dictionary.deposit.hints.status ? (
                  <FormDescription>
                    {dictionary.deposit.hints.status}
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
              name="chain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.deposit.fields.chain}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.deposit.hints.chain ? (
                    <FormDescription>
                      {dictionary.deposit.hints.chain}
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
                    {dictionary.deposit.fields.txHash}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.deposit.hints.txHash ? (
                    <FormDescription>
                      {dictionary.deposit.hints.txHash}
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
              name="fromAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.deposit.fields.fromAddress}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.deposit.hints.fromAddress ? (
                    <FormDescription>
                      {dictionary.deposit.hints.fromAddress}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="fromAddress-error" />
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
                      {dictionary.deposit.fields.confirmations}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.deposit.hints.confirmations ? (
                      <FormDescription>
                        {dictionary.deposit.hints.confirmations}
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
                name="requiredConfirmations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.deposit.fields.requiredConfirmations}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.deposit.hints.requiredConfirmations ? (
                      <FormDescription>
                        {dictionary.deposit.hints.requiredConfirmations}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="requiredConfirmations-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="detectedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.deposit.fields.detectedAt}
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

                  {dictionary.deposit.hints.detectedAt ? (
                    <FormDescription>
                      {dictionary.deposit.hints.detectedAt}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="detectedAt-error" />
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
                    {dictionary.deposit.fields.confirmedAt}
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

                  {dictionary.deposit.hints.confirmedAt ? (
                    <FormDescription>
                      {dictionary.deposit.hints.confirmedAt}
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
              name="creditedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.deposit.fields.creditedAt}
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

                  {dictionary.deposit.hints.creditedAt ? (
                    <FormDescription>
                      {dictionary.deposit.hints.creditedAt}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="creditedAt-error" />
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
                  <FormLabel>{dictionary.deposit.fields.account}</FormLabel>

                  <AccountAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.deposit.hints.account ? (
                    <FormDescription>
                      {dictionary.deposit.hints.account}
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
              name="asset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.deposit.fields.asset}</FormLabel>

                  <AssetAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.deposit.hints.asset ? (
                    <FormDescription>
                      {dictionary.deposit.hints.asset}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="asset-error" />
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
                    {dictionary.deposit.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.deposit.hints.meta ? (
                    <FormDescription>
                      {dictionary.deposit.hints.meta}
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
