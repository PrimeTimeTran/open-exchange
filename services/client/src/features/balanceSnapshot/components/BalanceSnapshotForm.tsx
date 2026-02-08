import { zodResolver } from '@hookform/resolvers/zod';
import { BalanceSnapshot } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { BalanceSnapshotWithRelationships } from 'src/features/balanceSnapshot/balanceSnapshotSchemas';
import {
  balanceSnapshotCreateApiCall,
  balanceSnapshotUpdateApiCall,
} from 'src/features/balanceSnapshot/balanceSnapshotApiCalls';
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
import { balanceSnapshotCreateInputSchema } from 'src/features/balanceSnapshot/balanceSnapshotSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import DateTimePickerInput from 'src/shared/components/form/DateTimePickerInput';
import { Textarea } from 'src/shared/components/ui/textarea';
import { AccountAutocompleteInput } from 'src/features/account/components/AccountAutocompleteInput';
import { WalletAutocompleteInput } from 'src/features/wallet/components/WalletAutocompleteInput';
import { AssetAutocompleteInput } from 'src/features/asset/components/AssetAutocompleteInput';

export function BalanceSnapshotForm({
  balanceSnapshot,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (balanceSnapshot: BalanceSnapshotWithRelationships) => void;
  balanceSnapshot?: Partial<BalanceSnapshotWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(balanceSnapshot?.id);

  const [initialValues] = React.useState({
    available: balanceSnapshot?.available ? Number(balanceSnapshot?.available) : '',
    locked: balanceSnapshot?.locked ? Number(balanceSnapshot?.locked) : '',
    total: balanceSnapshot?.total ? Number(balanceSnapshot?.total) : '',
    snapshotAt: balanceSnapshot?.snapshotAt || '',
    account: balanceSnapshot?.account || null,
    wallet: balanceSnapshot?.wallet || null,
    asset: balanceSnapshot?.asset || null,
    meta: balanceSnapshot?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(balanceSnapshotCreateInputSchema),
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
    mutationFn: (data: z.input<typeof balanceSnapshotCreateInputSchema>) => {
      if (balanceSnapshot?.id) {
        return balanceSnapshotUpdateApiCall(balanceSnapshot.id, data);
      } else {
        return balanceSnapshotCreateApiCall(data);
      }
    },
    onSuccess: (balanceSnapshot: BalanceSnapshot) => {
      queryClient.invalidateQueries({
        queryKey: ['balanceSnapshot'],
      });

      onSuccess(balanceSnapshot);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.balanceSnapshot.edit.success
          : dictionary.balanceSnapshot.new.success,
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
                name="available"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.balanceSnapshot.fields.available}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      autoFocus
          {...field}
                    />

                    {dictionary.balanceSnapshot.hints.available ? (
                      <FormDescription>
                        {dictionary.balanceSnapshot.hints.available}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="available-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="locked"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.balanceSnapshot.fields.locked}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.balanceSnapshot.hints.locked ? (
                      <FormDescription>
                        {dictionary.balanceSnapshot.hints.locked}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="locked-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.balanceSnapshot.fields.total}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.balanceSnapshot.hints.total ? (
                      <FormDescription>
                        {dictionary.balanceSnapshot.hints.total}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="total-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="snapshotAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.balanceSnapshot.fields.snapshotAt}
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

                  {dictionary.balanceSnapshot.hints.snapshotAt ? (
                    <FormDescription>
                      {dictionary.balanceSnapshot.hints.snapshotAt}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="snapshotAt-error" />
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
                  <FormLabel>{dictionary.balanceSnapshot.fields.account}</FormLabel>

                  <AccountAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.balanceSnapshot.hints.account ? (
                    <FormDescription>
                      {dictionary.balanceSnapshot.hints.account}
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
              name="wallet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.balanceSnapshot.fields.wallet}</FormLabel>

                  <WalletAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.balanceSnapshot.hints.wallet ? (
                    <FormDescription>
                      {dictionary.balanceSnapshot.hints.wallet}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="wallet-error" />
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
                  <FormLabel>{dictionary.balanceSnapshot.fields.asset}</FormLabel>

                  <AssetAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.balanceSnapshot.hints.asset ? (
                    <FormDescription>
                      {dictionary.balanceSnapshot.hints.asset}
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
                    {dictionary.balanceSnapshot.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.balanceSnapshot.hints.meta ? (
                    <FormDescription>
                      {dictionary.balanceSnapshot.hints.meta}
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
