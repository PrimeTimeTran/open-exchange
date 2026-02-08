import { zodResolver } from '@hookform/resolvers/zod';
import { Order } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { OrderWithRelationships } from 'src/features/order/orderSchemas';
import {
  orderCreateApiCall,
  orderUpdateApiCall,
} from 'src/features/order/orderApiCalls';
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
import { orderCreateInputSchema } from 'src/features/order/orderSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { orderEnumerators } from 'src/features/order/orderEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import { Input } from 'src/shared/components/ui/input';
import { Textarea } from 'src/shared/components/ui/textarea';
import { AccountAutocompleteInput } from 'src/features/account/components/AccountAutocompleteInput';
import { InstrumentAutocompleteInput } from 'src/features/instrument/components/InstrumentAutocompleteInput';

export function OrderForm({
  order,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (order: OrderWithRelationships) => void;
  order?: Partial<OrderWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(order?.id);

  const [initialValues] = React.useState({
    account: order?.account || null,
    instrument: order?.instrument || null,
    side: order?.side || null,
    type: order?.type || null,
    price: order?.price ? Number(order?.price) : '',
    quantity: order?.quantity ? Number(order?.quantity) : '',
    quantityFilled: order?.quantityFilled ? Number(order?.quantityFilled) : '',
    status: order?.status || null,
    timeInFore: order?.timeInFore || null,
    meta: order?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(orderCreateInputSchema),
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
    mutationFn: (data: z.input<typeof orderCreateInputSchema>) => {
      if (order?.id) {
        return orderUpdateApiCall(order.id, data);
      } else {
        return orderCreateApiCall(data);
      }
    },
    onSuccess: (order: Order) => {
      queryClient.invalidateQueries({
        queryKey: ['order'],
      });

      onSuccess(order);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.order.edit.success
          : dictionary.order.new.success,
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
              name="account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.order.fields.account}</FormLabel>

                  <AccountAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.order.hints.account ? (
                    <FormDescription>
                      {dictionary.order.hints.account}
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
              name="instrument"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.order.fields.instrument}</FormLabel>

                  <InstrumentAutocompleteInput
                    context={context}
                    onChange={field.onChange}
                    value={field.value}
                    isClearable={true}
                    disabled={mutation.isPending || mutation.isSuccess}
                    mode="memory"
                  />

                  {dictionary.order.hints.instrument ? (
                    <FormDescription>
                      {dictionary.order.hints.instrument}
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
            name="side"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.order.fields.side}</FormLabel>

                <SelectInput
                  options={Object.keys(orderEnumerators.side).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.order.enumerators.side,
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

                {dictionary.order.hints.side ? (
                  <FormDescription>
                    {dictionary.order.hints.side}
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.order.fields.type}</FormLabel>

                <SelectInput
                  options={Object.keys(orderEnumerators.type).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.order.enumerators.type,
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

                {dictionary.order.hints.type ? (
                  <FormDescription>
                    {dictionary.order.hints.type}
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.order.fields.price}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.order.hints.price ? (
                      <FormDescription>
                        {dictionary.order.hints.price}
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
                      {dictionary.order.fields.quantity}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.order.hints.quantity ? (
                      <FormDescription>
                        {dictionary.order.hints.quantity}
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
                name="quantityFilled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.order.fields.quantityFilled}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.order.hints.quantityFilled ? (
                      <FormDescription>
                        {dictionary.order.hints.quantityFilled}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="quantityFilled-error" />
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
                <FormLabel>{dictionary.order.fields.status}</FormLabel>

                <SelectInput
                  options={Object.keys(orderEnumerators.status).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.order.enumerators.status,
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

                {dictionary.order.hints.status ? (
                  <FormDescription>
                    {dictionary.order.hints.status}
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
            name="timeInFore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.order.fields.timeInFore}</FormLabel>

                <SelectInput
                  options={Object.keys(orderEnumerators.timeInFore).map(
                    (value) => ({
                      value,
                      label: enumeratorLabel(
                        dictionary.order.enumerators.timeInFore,
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

                {dictionary.order.hints.timeInFore ? (
                  <FormDescription>
                    {dictionary.order.hints.timeInFore}
                  </FormDescription>
                ) : null}

                <FormMessage data-testid="timeInFore-error" />
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
                    {dictionary.order.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.order.hints.meta ? (
                    <FormDescription>
                      {dictionary.order.hints.meta}
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
