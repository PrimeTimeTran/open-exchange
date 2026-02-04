import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuLoader2, LuSearch } from 'react-icons/lu';
import { RxReset } from 'react-icons/rx';
import { feeScheduleFilterFormSchema } from 'src/features/feeSchedule/feeScheduleSchemas';
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
import { feeScheduleEnumerators } from 'src/features/feeSchedule/feeScheduleEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import RangeInput from 'src/shared/components/form/RangeInput';
import DateTimePickerRangeInput from 'src/shared/components/form/DateTimePickerRangeInput';
import { Input } from 'src/shared/components/ui/input';
import { Switch } from 'src/shared/components/ui/switch';

const emptyValues = {
  scope: null,
  makerFeeBpsRange: [],
  takerFeeBpsRange: [],
  minFeeAmountRange: [],
  effectiveFromRange: [],
  effectiveToRange: [],
  tier: '',
  accountId: '',
  instrumentId: '',
  archived: false,
};

function FeeScheduleListFilter({
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
    scope: {
      label: dictionary.feeSchedule.fields.scope,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.feeSchedule.enumerators.scope,
      ),
    },
    makerFeeBpsRange: {
      label: dictionary.feeSchedule.fields.makerFeeBps,
      render: dataTableFilterRenders(context).range(),
    },
    takerFeeBpsRange: {
      label: dictionary.feeSchedule.fields.takerFeeBps,
      render: dataTableFilterRenders(context).range(),
    },
    minFeeAmountRange: {
      label: dictionary.feeSchedule.fields.minFeeAmount,
      render: dataTableFilterRenders(context).range(),
    },
    effectiveFromRange: {
      label: dictionary.feeSchedule.fields.effectiveFrom,
      render: dataTableFilterRenders(context).dateTimeRange(),
    },
    effectiveToRange: {
      label: dictionary.feeSchedule.fields.effectiveTo,
      render: dataTableFilterRenders(context).dateTimeRange(),
    },
    tier: {
      label: dictionary.feeSchedule.fields.tier,
    },
    accountId: {
      label: dictionary.feeSchedule.fields.accountId,
    },
    instrumentId: {
      label: dictionary.feeSchedule.fields.instrumentId,
    },
    archived: {
      label: dictionary.shared.showArchived,
      render: dataTableFilterRenders(context).booleanTrueOnly(),
    },
  };

  const filter = useMemo(
    () =>
      DataTableQueryParams.getFilter<z.infer<typeof feeScheduleFilterFormSchema>>(
        searchParams,
        feeScheduleFilterFormSchema,
      ),
    [searchParams],
  );

  const form = useForm({
    resolver: zodResolver(feeScheduleFilterFormSchema),
    mode: 'onSubmit',
    defaultValues: filter,
  });

  useEffect(() => {
    form.reset({ ...emptyValues, ...filter } as z.infer<
      typeof feeScheduleFilterFormSchema
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
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.feeSchedule.fields.scope}</FormLabel>
                    <SelectInput
                      options={Object.keys(feeScheduleEnumerators.scope).map(
                        (value) => ({
                          value,
                          label: enumeratorLabel(
                            dictionary.feeSchedule.enumerators.scope,
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
                name="makerFeeBpsRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.feeSchedule.fields.makerFeeBps}</FormLabel>
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
                name="takerFeeBpsRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.feeSchedule.fields.takerFeeBps}</FormLabel>
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
                name="minFeeAmountRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.feeSchedule.fields.minFeeAmount}</FormLabel>
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
                name="effectiveFromRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.feeSchedule.fields.effectiveFrom}
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
                name="effectiveToRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.feeSchedule.fields.effectiveTo}
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
                name="tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.feeSchedule.fields.tier}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.feeSchedule.fields.accountId}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instrumentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.feeSchedule.fields.instrumentId}</FormLabel>
                    <Input disabled={isLoading} {...field} />
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

export default FeeScheduleListFilter;

