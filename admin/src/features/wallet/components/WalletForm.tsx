import { zodResolver } from '@hookform/resolvers/zod';
import { Wallet } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { WalletWithRelationships } from 'src/features/wallet/walletSchemas';
import {
  walletCreateApiCall,
  walletUpdateApiCall,
} from 'src/features/wallet/walletApiCalls';
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
import { walletCreateInputSchema } from 'src/features/wallet/walletSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { Textarea } from 'src/shared/components/ui/textarea';
import { MembershipAutocompleteInput } from 'src/features/membership/components/MembershipAutocompleteInput';
import { AssetAutocompleteInput } from 'src/features/asset/components/AssetAutocompleteInput';
import { AccountAutocompleteInput } from 'src/features/account/components/AccountAutocompleteInput';

export function WalletForm({
  wallet,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (wallet: WalletWithRelationships) => void;
  wallet?: Partial<WalletWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(wallet?.id);

  const [initialValues] = React.useState({
    available: wallet?.available || '',
    locked: wallet?.locked || '',
    total: wallet?.total || '',
    version: wallet?.version || '',
    meta: wallet?.meta?.toString() || '',
    user: wallet?.user || null,
    asset: wallet?.asset || null,
    account: wallet?.account || null,
  });

  const form = useForm({
    resolver: zodResolver(walletCreateInputSchema),
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
    mutationFn: (data: z.input<typeof walletCreateInputSchema>) => {
      if (wallet?.id) {
        return walletUpdateApiCall(wallet.id, data);
      } else {
        return walletCreateApiCall(data);
      }
    },
    onSuccess: (wallet: Wallet) => {
      queryClient.invalidateQueries({
        queryKey: ['wallet'],
      });

      onSuccess(wallet);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.wallet.edit.success
          : dictionary.wallet.new.success,
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
                      {dictionary.wallet.fields.available}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      autoFocus
          {...field}
                    />

                    {dictionary.wallet.hints.available ? (
                      <FormDescription>
                        {dictionary.wallet.hints.available}
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
                      {dictionary.wallet.fields.locked}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.wallet.hints.locked ? (
                      <FormDescription>
                        {dictionary.wallet.hints.locked}
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
                      {dictionary.wallet.fields.total}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.wallet.hints.total ? (
                      <FormDescription>
                        {dictionary.wallet.hints.total}
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
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.wallet.fields.version}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.wallet.hints.version ? (
                      <FormDescription>
                        {dictionary.wallet.hints.version}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="version-error" />
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
                    {dictionary.wallet.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.wallet.hints.meta ? (
                    <FormDescription>
                      {dictionary.wallet.hints.meta}
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
                  <FormLabel>{dictionary.wallet.fields.user}</FormLabel>

                  <MembershipAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.wallet.hints.user ? (
                    <FormDescription>
                      {dictionary.wallet.hints.user}
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
              name="asset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.wallet.fields.asset}</FormLabel>

                  <AssetAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.wallet.hints.asset ? (
                    <FormDescription>
                      {dictionary.wallet.hints.asset}
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
              name="account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.wallet.fields.account}</FormLabel>

                  <AccountAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.wallet.hints.account ? (
                    <FormDescription>
                      {dictionary.wallet.hints.account}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="account-error" />
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
