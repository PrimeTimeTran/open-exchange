import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuLoader2, LuSearch } from 'react-icons/lu';
import { RxReset } from 'react-icons/rx';
import { withdrawalFilterFormSchema } from 'src/features/withdrawal/withdrawalSchemas';
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
import RangeInput from 'src/shared/components/form/RangeInput';
import { withdrawalEnumerators } from 'src/features/withdrawal/withdrawalEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import { Input } from 'src/shared/components/ui/input';
import DateTimePickerRangeInput from 'src/shared/components/form/DateTimePickerRangeInput';
import { Switch } from 'src/shared/components/ui/switch';

const emptyValues = {
  amountRange: [],
  feeRange: [],
  status: null,
  destinationAddress: '',
  destinationTag: '',
  chain: '',
  txHash: '',
  failureReason: '',
  requestedBy: '',
  approvedBy: '',
  approvedAtRange: [],
  requestedAtRange: [],
  broadcastAtRange: [],
  confirmedAtRange: [],
  confirmationsRange: [],
  account: null,
  asset: null,
  archived: false,
};

function WithdrawalListFilter({
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
    amountRange: {
      label: dictionary.withdrawal.fields.amount,
      render: dataTableFilterRenders(context).range(),
    },
    feeRange: {
      label: dictionary.withdrawal.fields.fee,
      render: dataTableFilterRenders(context).range(),
    },
    status: {
      label: dictionary.withdrawal.fields.status,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.withdrawal.enumerators.status,
      ),
    },
    destinationAddress: {
      label: dictionary.withdrawal.fields.destinationAddress,
    },
    destinationTag: {
      label: dictionary.withdrawal.fields.destinationTag,
    },
    chain: {
      label: dictionary.withdrawal.fields.chain,
    },
    txHash: {
      label: dictionary.withdrawal.fields.txHash,
    },
    failureReason: {
      label: dictionary.withdrawal.fields.failureReason,
    },
    requestedBy: {
      label: dictionary.withdrawal.fields.requestedBy,
    },
    approvedBy: {
      label: dictionary.withdrawal.fields.approvedBy,
    },
    approvedAtRange: {
      label: dictionary.withdrawal.fields.approvedAt,
      render: dataTableFilterRenders(context).dateTimeRange(),
    },
    requestedAtRange: {
      label: dictionary.withdrawal.fields.requestedAt,
      render: dataTableFilterRenders(context).dateTimeRange(),
    },
    broadcastAtRange: {
      label: dictionary.withdrawal.fields.broadcastAt,
      render: dataTableFilterRenders(context).dateTimeRange(),
    },
    confirmedAtRange: {
      label: dictionary.withdrawal.fields.confirmedAt,
      render: dataTableFilterRenders(context).dateTimeRange(),
    },
    confirmationsRange: {
      label: dictionary.withdrawal.fields.confirmations,
      render: dataTableFilterRenders(context).range(),
    },
    archived: {
      label: dictionary.shared.showArchived,
      render: dataTableFilterRenders(context).booleanTrueOnly(),
    },
  };

  const filter = useMemo(
    () =>
      DataTableQueryParams.getFilter<z.infer<typeof withdrawalFilterFormSchema>>(
        searchParams,
        withdrawalFilterFormSchema,
      ),
    [searchParams],
  );

  const form = useForm({
    resolver: zodResolver(withdrawalFilterFormSchema),
    mode: 'onSubmit',
    defaultValues: filter,
  });

  useEffect(() => {
    form.reset({ ...emptyValues, ...filter } as z.infer<
      typeof withdrawalFilterFormSchema
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
                name="amountRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.withdrawal.fields.amount}</FormLabel>
                    <RangeInput
                      type="number"
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
                name="feeRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.withdrawal.fields.fee}</FormLabel>
                    <RangeInput
                      type="number"
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
                name="destinationAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.withdrawal.fields.destinationAddress}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destinationTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.withdrawal.fields.destinationTag}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.withdrawal.fields.chain}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="txHash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.withdrawal.fields.txHash}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="failureReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.withdrawal.fields.failureReason}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requestedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.withdrawal.fields.requestedBy}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approvedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.withdrawal.fields.approvedBy}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approvedAtRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.withdrawal.fields.approvedAt}
                    </FormLabel>
                    <DateTimePickerRangeInput
                      dictionary={dictionary}
                      locale={locale}
                      disabled={isLoading}
                      isClearable={true}
                      onChange={field.onChange}
                      value={field.value}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requestedAtRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.withdrawal.fields.requestedAt}
                    </FormLabel>
                    <DateTimePickerRangeInput
                      dictionary={dictionary}
                      locale={locale}
                      disabled={isLoading}
                      isClearable={true}
                      onChange={field.onChange}
                      value={field.value}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="broadcastAtRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.withdrawal.fields.broadcastAt}
                    </FormLabel>
                    <DateTimePickerRangeInput
                      dictionary={dictionary}
                      locale={locale}
                      disabled={isLoading}
                      isClearable={true}
                      onChange={field.onChange}
                      value={field.value}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmedAtRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.withdrawal.fields.confirmedAt}
                    </FormLabel>
                    <DateTimePickerRangeInput
                      dictionary={dictionary}
                      locale={locale}
                      disabled={isLoading}
                      isClearable={true}
                      onChange={field.onChange}
                      value={field.value}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmationsRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.withdrawal.fields.confirmations}</FormLabel>
                    <RangeInput
                      type="number"
                      dictionary={dictionary}
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

export default WithdrawalListFilter;

