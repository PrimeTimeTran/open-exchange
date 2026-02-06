import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuLoader2, LuSearch } from 'react-icons/lu';
import { RxReset } from 'react-icons/rx';
import { marketMakerFilterFormSchema } from 'src/features/marketMaker/marketMakerSchemas';
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
import { Input } from 'src/shared/components/ui/input';
import { marketMakerEnumerators } from 'src/features/marketMaker/marketMakerEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import RangeInput from 'src/shared/components/form/RangeInput';
import DateTimePickerRangeInput from 'src/shared/components/form/DateTimePickerRangeInput';
import { Switch } from 'src/shared/components/ui/switch';

const emptyValues = {
  organizationName: '',
  contactEmail: '',
  contactPhone: '',
  status: null,
  tier: null,
  marketsSupported: '',
  minQuoteSizeRange: [],
  maxQuoteSizeRange: [],
  spreadLimitRange: [],
  quoteObligation: '',
  dailyVolumeTargetRange: [],
  makerFeeRange: [],
  takerFeeRange: [],
  rebateRateRange: [],
  rebateBalanceRange: [],
  apiAccess: '',
  maxOrdersPerSecondRange: [],
  directMarketAccess: '',
  contractSignedAtRange: [],
  obligationViolationCountRange: [],
  notesInternal: '',
  specialOrderTypes: null,
  archived: false,
};

function MarketMakerListFilter({
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
    organizationName: {
      label: dictionary.marketMaker.fields.organizationName,
    },
    contactEmail: {
      label: dictionary.marketMaker.fields.contactEmail,
    },
    contactPhone: {
      label: dictionary.marketMaker.fields.contactPhone,
    },
    status: {
      label: dictionary.marketMaker.fields.status,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.marketMaker.enumerators.status,
      ),
    },
    tier: {
      label: dictionary.marketMaker.fields.tier,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.marketMaker.enumerators.tier,
      ),
    },
    marketsSupported: {
      label: dictionary.marketMaker.fields.marketsSupported,
    },
    minQuoteSizeRange: {
      label: dictionary.marketMaker.fields.minQuoteSize,
      render: dataTableFilterRenders(context).range(),
    },
    maxQuoteSizeRange: {
      label: dictionary.marketMaker.fields.maxQuoteSize,
      render: dataTableFilterRenders(context).range(),
    },
    spreadLimitRange: {
      label: dictionary.marketMaker.fields.spreadLimit,
      render: dataTableFilterRenders(context).range(),
    },
    quoteObligation: {
      label: dictionary.marketMaker.fields.quoteObligation,
      render: dataTableFilterRenders(context).boolean(),
    },
    dailyVolumeTargetRange: {
      label: dictionary.marketMaker.fields.dailyVolumeTarget,
      render: dataTableFilterRenders(context).range(),
    },
    makerFeeRange: {
      label: dictionary.marketMaker.fields.makerFee,
      render: dataTableFilterRenders(context).range(),
    },
    takerFeeRange: {
      label: dictionary.marketMaker.fields.takerFee,
      render: dataTableFilterRenders(context).range(),
    },
    rebateRateRange: {
      label: dictionary.marketMaker.fields.rebateRate,
      render: dataTableFilterRenders(context).range(),
    },
    rebateBalanceRange: {
      label: dictionary.marketMaker.fields.rebateBalance,
      render: dataTableFilterRenders(context).range(),
    },
    apiAccess: {
      label: dictionary.marketMaker.fields.apiAccess,
      render: dataTableFilterRenders(context).boolean(),
    },
    maxOrdersPerSecondRange: {
      label: dictionary.marketMaker.fields.maxOrdersPerSecond,
      render: dataTableFilterRenders(context).range(),
    },
    directMarketAccess: {
      label: dictionary.marketMaker.fields.directMarketAccess,
      render: dataTableFilterRenders(context).boolean(),
    },
    contractSignedAtRange: {
      label: dictionary.marketMaker.fields.contractSignedAt,
      render: dataTableFilterRenders(context).dateTimeRange(),
    },
    obligationViolationCountRange: {
      label: dictionary.marketMaker.fields.obligationViolationCount,
      render: dataTableFilterRenders(context).range(),
    },
    notesInternal: {
      label: dictionary.marketMaker.fields.notesInternal,
    },
    specialOrderTypes: {
      label: dictionary.marketMaker.fields.specialOrderTypes,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.marketMaker.enumerators.specialOrderTypes,
      ),
    },
    archived: {
      label: dictionary.shared.showArchived,
      render: dataTableFilterRenders(context).booleanTrueOnly(),
    },
  };

  const filter = useMemo(
    () =>
      DataTableQueryParams.getFilter<z.infer<typeof marketMakerFilterFormSchema>>(
        searchParams,
        marketMakerFilterFormSchema,
      ),
    [searchParams],
  );

  const form = useForm({
    resolver: zodResolver(marketMakerFilterFormSchema),
    mode: 'onSubmit',
    defaultValues: filter,
  });

  useEffect(() => {
    form.reset({ ...emptyValues, ...filter } as z.infer<
      typeof marketMakerFilterFormSchema
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
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.organizationName}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.contactEmail}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.contactPhone}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.status}</FormLabel>
                    <SelectInput
                      options={Object.keys(marketMakerEnumerators.status).map(
                        (value) => ({
                          value,
                          label: enumeratorLabel(
                            dictionary.marketMaker.enumerators.status,
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
                name="tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.tier}</FormLabel>
                    <SelectInput
                      options={Object.keys(marketMakerEnumerators.tier).map(
                        (value) => ({
                          value,
                          label: enumeratorLabel(
                            dictionary.marketMaker.enumerators.tier,
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
                name="marketsSupported"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.marketsSupported}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minQuoteSizeRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.minQuoteSize}</FormLabel>
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
                name="maxQuoteSizeRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.maxQuoteSize}</FormLabel>
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
                name="spreadLimitRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.spreadLimit}</FormLabel>
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
                name="quoteObligation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.marketMaker.fields.quoteObligation}
                    </FormLabel>
                    <SelectInput
                      options={[
                        {
                          label: dictionary.shared.yes,
                          value: 'true',
                        },
                        {
                          label: dictionary.shared.no,
                          value: 'false',
                        },
                      ]}
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
                name="dailyVolumeTargetRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.dailyVolumeTarget}</FormLabel>
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
                name="makerFeeRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.makerFee}</FormLabel>
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
                name="takerFeeRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.takerFee}</FormLabel>
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
                name="rebateRateRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.rebateRate}</FormLabel>
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
                name="rebateBalanceRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.rebateBalance}</FormLabel>
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
                name="apiAccess"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.marketMaker.fields.apiAccess}
                    </FormLabel>
                    <SelectInput
                      options={[
                        {
                          label: dictionary.shared.yes,
                          value: 'true',
                        },
                        {
                          label: dictionary.shared.no,
                          value: 'false',
                        },
                      ]}
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
                name="maxOrdersPerSecondRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.maxOrdersPerSecond}</FormLabel>
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
                name="directMarketAccess"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.marketMaker.fields.directMarketAccess}
                    </FormLabel>
                    <SelectInput
                      options={[
                        {
                          label: dictionary.shared.yes,
                          value: 'true',
                        },
                        {
                          label: dictionary.shared.no,
                          value: 'false',
                        },
                      ]}
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
                name="contractSignedAtRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.marketMaker.fields.contractSignedAt}
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
                name="obligationViolationCountRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.obligationViolationCount}</FormLabel>
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
                name="notesInternal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.notesInternal}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialOrderTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.marketMaker.fields.specialOrderTypes}</FormLabel>
                    <SelectInput
                      options={Object.keys(marketMakerEnumerators.specialOrderTypes).map(
                        (value) => ({
                          value,
                          label: enumeratorLabel(
                            dictionary.marketMaker.enumerators.specialOrderTypes,
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

export default MarketMakerListFilter;

