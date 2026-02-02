import { zodResolver } from '@hookform/resolvers/zod';
import { TradeFill } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { TradeFillWithRelationships } from 'src/features/tradeFill/tradeFillSchemas';
import {
  tradeFillCreateApiCall,
  tradeFillUpdateApiCall,
} from 'src/features/tradeFill/tradeFillApiCalls';
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
import { tradeFillCreateInputSchema } from 'src/features/tradeFill/tradeFillSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { tradeFillEnumerators } from 'src/features/tradeFill/tradeFillEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import { Input } from 'src/shared/components/ui/input';
import { TradeAutocompleteInput } from 'src/features/trade/components/TradeAutocompleteInput';

export function TradeFillForm({
  tradeFill,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (tradeFill: TradeFillWithRelationships) => void;
  tradeFill?: Partial<TradeFillWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(tradeFill?.id);

  const [initialValues] = React.useState({
    side: tradeFill?.side || null,
    price: tradeFill?.price ? Number(tradeFill?.price) : '',
    quantity: tradeFill?.quantity ? Number(tradeFill?.quantity) : '',
    fee: tradeFill?.fee ? Number(tradeFill?.fee) : '',
    trade: tradeFill?.trade || null,
  });

  const form = useForm({
    resolver: zodResolver(tradeFillCreateInputSchema),
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
    mutationFn: (data: z.input<typeof tradeFillCreateInputSchema>) => {
      if (tradeFill?.id) {
        return tradeFillUpdateApiCall(tradeFill.id, data);
      } else {
        return tradeFillCreateApiCall(data);
      }
    },
    onSuccess: (tradeFill: TradeFill) => {
      queryClient.invalidateQueries({
        queryKey: ['tradeFill'],
      });

      onSuccess(tradeFill);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.tradeFill.edit.success
          : dictionary.tradeFill.new.success,
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
            name="side"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.tradeFill.fields.side}</FormLabel>

                <SelectInput
                  options={Object.keys(tradeFillEnumerators.side).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.tradeFill.enumerators.side,
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

                {dictionary.tradeFill.hints.side ? (
                  <FormDescription>
                    {dictionary.tradeFill.hints.side}
                  </FormDescription>
                ) : null}

                <FormMessage data-testid="side-error" />
              </FormItem>
            )}
          />
          </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.tradeFill.fields.price}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.tradeFill.hints.price ? (
                      <FormDescription>
                        {dictionary.tradeFill.hints.price}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="price-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.tradeFill.fields.quantity}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.tradeFill.hints.quantity ? (
                      <FormDescription>
                        {dictionary.tradeFill.hints.quantity}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="quantity-error" />
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
                      {dictionary.tradeFill.fields.fee}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.tradeFill.hints.fee ? (
                      <FormDescription>
                        {dictionary.tradeFill.hints.fee}
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
              name="trade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.tradeFill.fields.trade}</FormLabel>

                  <TradeAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.tradeFill.hints.trade ? (
                    <FormDescription>
                      {dictionary.tradeFill.hints.trade}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="trade-error" />
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
