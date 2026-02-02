import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuLoader2, LuSearch } from 'react-icons/lu';
import { RxReset } from 'react-icons/rx';
import { orderFilterFormSchema } from 'src/features/order/orderSchemas';
import { cn } from 'src/shared/components/cn';
import FilterPreview from 'src/shared/components/dataTable/DataTableFilterPreview';
import { DataTableQueryParams } from 'src/shared/components/dataTable/DataTableQueryParams';
import { dataTableFilterRenders } from 'src/shared/components/dataTable/dataTableFilterRenders';
import { Button } from 'src/shared/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'src/shared/components/ui/form';
import { AppContext } from 'src/shared/controller/appContext';
import { getZodErrorMap } from 'src/translation/getZodErrorMap';
import { z } from 'zod';
import { orderEnumerators } from 'src/features/order/orderEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import RangeInput from 'src/shared/components/form/RangeInput';
import { Switch } from 'src/shared/components/ui/switch';

const emptyValues = {
  side: null,
  type: null,
  priceRange: [],
  quantityRange: [],
  quantityFilledRange: [],
  status: null,
  timeInFore: null,
  account: null,
  instrument: null,
  archived: false,
};

function OrderListFilter({
  context,
  isLoading,
}: {
  context: AppContext;
  isLoading: boolean;
}) {
  const { dictionary, locale } = context;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  z.setErrorMap(getZodErrorMap(locale));

  const previewRenders = {
    side: {
      label: dictionary.order.fields.side,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.order.enumerators.side,
      ),
    },
    type: {
      label: dictionary.order.fields.type,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.order.enumerators.type,
      ),
    },
    priceRange: {
      label: dictionary.order.fields.price,
      render: dataTableFilterRenders(context).decimalRange(),
    },
    quantityRange: {
      label: dictionary.order.fields.quantity,
      render: dataTableFilterRenders(context).decimalRange(),
    },
    quantityFilledRange: {
      label: dictionary.order.fields.quantityFilled,
      render: dataTableFilterRenders(context).decimalRange(),
    },
    status: {
      label: dictionary.order.fields.status,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.order.enumerators.status,
      ),
    },
    timeInFore: {
      label: dictionary.order.fields.timeInFore,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.order.enumerators.timeInFore,
      ),
    },
    archived: {
      label: dictionary.shared.showArchived,
      render: dataTableFilterRenders(context).booleanTrueOnly(),
    },
  };

  const filter = useMemo(
    () =>
      DataTableQueryParams.getFilter<z.infer<typeof orderFilterFormSchema>>(
        searchParams,
        orderFilterFormSchema,
      ),
    [searchParams],
  );

  const form = useForm({
    resolver: zodResolver(orderFilterFormSchema),
    mode: 'onSubmit',
    defaultValues: filter,
  });

  useEffect(() => {
    form.reset({ ...emptyValues, ...filter } as z.infer<
      typeof orderFilterFormSchema
    >);
  }, [filter, form]);

  const onRemove = (key: string) => {
    DataTableQueryParams.onFilterChange(
      { ...filter, [key]: undefined },
      router,
      searchParams,
    );
  };

  const onSubmit = (data: any) => {
    DataTableQueryParams.onFilterChange(data, router, searchParams);
    setExpanded(false);
  };

  const doReset = () => {
    DataTableQueryParams.onFilterChange({}, router, searchParams);
    setExpanded(false);
  };

  return (
    <div className="rounded-md border">
      <FilterPreview
        onClick={() => {
          setExpanded(!expanded);
        }}
        renders={previewRenders}
        values={filter}
        expanded={expanded}
        onRemove={onRemove}
        dictionary={dictionary}
      />
      <div className={cn(expanded ? 'block' : 'hidden', 'p-4')}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      disabled={isLoading}
                      onChange={field.onChange}
                      value={field.value}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      disabled={isLoading}
                      onChange={field.onChange}
                      value={field.value}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priceRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.order.fields.price}</FormLabel>
                    <RangeInput
                      type="text"
                      dictionary={dictionary}
                      disabled={isLoading}
                      onChange={field.onChange}
                      value={field.value}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantityRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.order.fields.quantity}</FormLabel>
                    <RangeInput
                      type="text"
                      dictionary={dictionary}
                      disabled={isLoading}
                      onChange={field.onChange}
                      value={field.value}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantityFilledRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.order.fields.quantityFilled}</FormLabel>
                    <RangeInput
                      type="text"
                      dictionary={dictionary}
                      disabled={isLoading}
                      onChange={field.onChange}
                      value={field.value}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      disabled={isLoading}
                      onChange={field.onChange}
                      value={field.value}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      disabled={isLoading}
                      onChange={field.onChange}
                      value={field.value}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="archived"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.shared.showArchived}</FormLabel>
                    <br />
                    <Switch
                      checked={String(field.value) === 'true'}
                      onCheckedChange={(val) =>
                        field.onChange(val ? 'true' : 'false')
                      }
                      disabled={isLoading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button disabled={isLoading} type="submit" size={'sm'}>
                {isLoading ? (
                  <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LuSearch className="mr-2 h-4 w-4" />
                )}
                {dictionary.shared.search}
              </Button>

              <Button
                disabled={isLoading}
                type="button"
                variant={'secondary'}
                onClick={doReset}
                size={'sm'}
              >
                <RxReset className="mr-2 h-4 w-4" />
                {dictionary.shared.reset}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default OrderListFilter;

