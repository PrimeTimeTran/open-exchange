import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuLoader2, LuSearch } from 'react-icons/lu';
import { RxReset } from 'react-icons/rx';
import { listingFilterFormSchema } from 'src/features/listing/listingSchemas';
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
import DatePickerRangeInput from 'src/shared/components/form/DatePickerRangeInput';
import { listingEnumerators } from 'src/features/listing/listingEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import { Switch } from 'src/shared/components/ui/switch';

const emptyValues = {
  companyName: '',
  legalName: '',
  jurisdiction: '',
  incorporationDateRange: [],
  website: '',
  assetSymbol: '',
  assetClass: null,
  status: null,
  submittedAtRange: [],
  decisionAtRange: [],
  kycCompleted: '',
  docsSubmitted: '',
  riskDisclosureUrl: '',
  primaryContactName: '',
  primaryContactEmail: '',
  reviewedBy: '',
  notes: '',
  archived: false,
};

function ListingListFilter({
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
    companyName: {
      label: dictionary.listing.fields.companyName,
    },
    legalName: {
      label: dictionary.listing.fields.legalName,
    },
    jurisdiction: {
      label: dictionary.listing.fields.jurisdiction,
    },
    incorporationDateRange: {
      label: dictionary.listing.fields.incorporationDate,
      render: dataTableFilterRenders(context).dateRange(),
    },
    website: {
      label: dictionary.listing.fields.website,
    },
    assetSymbol: {
      label: dictionary.listing.fields.assetSymbol,
    },
    assetClass: {
      label: dictionary.listing.fields.assetClass,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.listing.enumerators.assetClass,
      ),
    },
    status: {
      label: dictionary.listing.fields.status,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.listing.enumerators.status,
      ),
    },
    submittedAtRange: {
      label: dictionary.listing.fields.submittedAt,
      render: dataTableFilterRenders(context).dateRange(),
    },
    decisionAtRange: {
      label: dictionary.listing.fields.decisionAt,
      render: dataTableFilterRenders(context).dateRange(),
    },
    kycCompleted: {
      label: dictionary.listing.fields.kycCompleted,
      render: dataTableFilterRenders(context).boolean(),
    },
    docsSubmitted: {
      label: dictionary.listing.fields.docsSubmitted,
      render: dataTableFilterRenders(context).boolean(),
    },
    riskDisclosureUrl: {
      label: dictionary.listing.fields.riskDisclosureUrl,
    },
    primaryContactName: {
      label: dictionary.listing.fields.primaryContactName,
    },
    primaryContactEmail: {
      label: dictionary.listing.fields.primaryContactEmail,
    },
    reviewedBy: {
      label: dictionary.listing.fields.reviewedBy,
    },
    notes: {
      label: dictionary.listing.fields.notes,
    },
    archived: {
      label: dictionary.shared.showArchived,
      render: dataTableFilterRenders(context).booleanTrueOnly(),
    },
  };

  const filter = useMemo(
    () =>
      DataTableQueryParams.getFilter<z.infer<typeof listingFilterFormSchema>>(
        searchParams,
        listingFilterFormSchema,
      ),
    [searchParams],
  );

  const form = useForm({
    resolver: zodResolver(listingFilterFormSchema),
    mode: 'onSubmit',
    defaultValues: filter,
  });

  useEffect(() => {
    form.reset({ ...emptyValues, ...filter } as z.infer<
      typeof listingFilterFormSchema
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
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.listing.fields.companyName}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.listing.fields.legalName}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jurisdiction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.listing.fields.jurisdiction}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="incorporationDateRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.listing.fields.incorporationDate}
                    </FormLabel>
                    <DatePickerRangeInput
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
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.listing.fields.website}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assetSymbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.listing.fields.assetSymbol}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assetClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.listing.fields.assetClass}</FormLabel>
                    <SelectInput
                      options={Object.keys(listingEnumerators.assetClass).map(
                        (value) => ({
                          value,
                          label: enumeratorLabel(
                            dictionary.listing.enumerators.assetClass,
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.listing.fields.status}</FormLabel>
                    <SelectInput
                      options={Object.keys(listingEnumerators.status).map(
                        (value) => ({
                          value,
                          label: enumeratorLabel(
                            dictionary.listing.enumerators.status,
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
                name="submittedAtRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.listing.fields.submittedAt}
                    </FormLabel>
                    <DatePickerRangeInput
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
                name="decisionAtRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.listing.fields.decisionAt}
                    </FormLabel>
                    <DatePickerRangeInput
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
                name="kycCompleted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.listing.fields.kycCompleted}
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
                name="docsSubmitted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.listing.fields.docsSubmitted}
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
                name="riskDisclosureUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.listing.fields.riskDisclosureUrl}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primaryContactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.listing.fields.primaryContactName}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primaryContactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.listing.fields.primaryContactEmail}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reviewedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.listing.fields.reviewedBy}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.listing.fields.notes}</FormLabel>
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

export default ListingListFilter;

