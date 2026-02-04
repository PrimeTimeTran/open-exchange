import { zodResolver } from '@hookform/resolvers/zod';
import { Trade } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { TradeWithRelationships } from 'src/features/trade/tradeSchemas';
import {
  tradeCreateApiCall,
  tradeUpdateApiCall,
} from 'src/features/trade/tradeApiCalls';
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
import { tradeCreateInputSchema } from 'src/features/trade/tradeSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { Textarea } from 'src/shared/components/ui/textarea';
import { OrderAutocompleteMultipleInput } from 'src/features/order/components/OrderAutocompleteMultipleInput';
import { InstrumentAutocompleteInput } from 'src/features/instrument/components/InstrumentAutocompleteInput';

export function TradeForm({
  trade,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (trade: TradeWithRelationships) => void;
  trade?: Partial<TradeWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(trade?.id);

  const [initialValues] = React.useState({
    price: trade?.price ? Number(trade?.price) : '',
    quantity: trade?.quantity ? Number(trade?.quantity) : '',
    buyOrderId: trade?.buyOrderId || [],
    sellOrderId: trade?.sellOrderId || [],
    instrument: trade?.instrument || null,
    meta: trade?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(tradeCreateInputSchema),
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
    mutationFn: (data: z.input<typeof tradeCreateInputSchema>) => {
      if (trade?.id) {
        return tradeUpdateApiCall(trade.id, data);
      } else {
        return tradeCreateApiCall(data);
      }
    },
    onSuccess: (trade: Trade) => {
      queryClient.invalidateQueries({
        queryKey: ['trade'],
      });

      onSuccess(trade);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.trade.edit.success
          : dictionary.trade.new.success,
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.trade.fields.price}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      autoFocus
          {...field}
                    />

                    {dictionary.trade.hints.price ? (
                      <FormDescription>
                        {dictionary.trade.hints.price}
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
                      {dictionary.trade.fields.quantity}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.trade.hints.quantity ? (
                      <FormDescription>
                        {dictionary.trade.hints.quantity}
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
              name="buyOrderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.trade.fields.buyOrderId}</FormLabel>

                  <OrderAutocompleteMultipleInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.trade.hints.buyOrderId ? (
                    <FormDescription>
                      {dictionary.trade.hints.buyOrderId}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="buyOrderId-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="sellOrderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.trade.fields.sellOrderId}</FormLabel>

                  <OrderAutocompleteMultipleInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.trade.hints.sellOrderId ? (
                    <FormDescription>
                      {dictionary.trade.hints.sellOrderId}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="sellOrderId-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="instrument"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.trade.fields.instrument}</FormLabel>

                  <InstrumentAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.trade.hints.instrument ? (
                    <FormDescription>
                      {dictionary.trade.hints.instrument}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="instrument-error" />
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
                    {dictionary.trade.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.trade.hints.meta ? (
                    <FormDescription>
                      {dictionary.trade.hints.meta}
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
