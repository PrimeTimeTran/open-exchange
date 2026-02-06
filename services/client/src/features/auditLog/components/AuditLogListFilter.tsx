import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuLoader2, LuSearch } from 'react-icons/lu';
import { RxReset } from 'react-icons/rx';
import { apiKeyLabel } from 'src/features/apiKey/apiKeyLabel';
import { ApiKeyAutocompleteInput } from 'src/features/apiKey/components/ApiKeyAutocompleteInput';
import { auditLogOperations } from 'src/features/auditLog/auditLogOperations';
import { auditLogFilterFormSchema } from 'src/features/auditLog/auditLogSchemas';
import { MembershipAutocompleteInput } from 'src/features/membership/components/MembershipAutocompleteInput';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { cn } from 'src/shared/components/cn';
import FilterPreview from 'src/shared/components/dataTable/DataTableFilterPreview';
import { DataTableQueryParams } from 'src/shared/components/dataTable/DataTableQueryParams';
import { dataTableFilterRenders } from 'src/shared/components/dataTable/dataTableFilterRenders';
import DateTimePickerRangeInput from 'src/shared/components/form/DateTimePickerRangeInput';
import SelectMultipleInput from 'src/shared/components/form/SelectMultipleInput';
import TagsInput from 'src/shared/components/form/TagsInput';
import { Button } from 'src/shared/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'src/shared/components/ui/form';
import { Input } from 'src/shared/components/ui/input';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { getZodErrorMap } from 'src/translation/getZodErrorMap';
import { z } from 'zod';

const emptyValues = {
  apiKey: null,
  membership: null,
  entityId: '',
  apiHttpResponseCode: '',
  apiEndpoint: '',
  transactionId: '',
  operations: [],
  entityNames: [],
  timestampRange: [],
};

export function AuditLogListFilter({
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
    entityNames: {
      label: dictionary.auditLog.fields.entityNames,
      render: dataTableFilterRenders(context).stringArray(),
    },
    entityId: {
      label: dictionary.auditLog.fields.entityId,
    },
    operations: {
      label: dictionary.auditLog.fields.operations,
      render: dataTableFilterRenders(context).enumeratorMultiple(
        dictionary.auditLog.enumerators.operation,
      ),
    },
    timestampRange: {
      label: dictionary.auditLog.fields.timestamp,
      render: dataTableFilterRenders(context).dateTimeRange(),
    },
    membership: {
      label: dictionary.auditLog.fields.membership,
      render: dataTableFilterRenders(context).relationToOne(membershipLabel),
    },
    transactionId: {
      label: dictionary.auditLog.fields.transactionId,
    },
    apiKey: {
      label: dictionary.auditLog.fields.apiKey,
      render: dataTableFilterRenders(context).relationToOne(apiKeyLabel),
    },
    apiHttpResponseCode: {
      label: dictionary.auditLog.fields.apiHttpResponseCode,
    },
    apiEndpoint: {
      label: dictionary.auditLog.fields.apiEndpoint,
    },
  };

  const filter = useMemo(
    () =>
      DataTableQueryParams.getFilter<z.infer<typeof auditLogFilterFormSchema>>(
        searchParams,
        auditLogFilterFormSchema,
      ),
    [searchParams],
  );

  const form = useForm({
    resolver: zodResolver(auditLogFilterFormSchema),
    mode: 'onSubmit',
    defaultValues: filter,
  });

  useEffect(() => {
    form.reset({ ...emptyValues, ...filter } as z.infer<
      typeof auditLogFilterFormSchema
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
                name="timestampRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.auditLog.fields.timestamp}
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
                name="membership"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.auditLog.fields.membership}
                    </FormLabel>
                    <MembershipAutocompleteInput
                      context={context}
                      onChange={field.onChange}
                      value={field.value}
                      mode="memory"
                      isClearable={true}
                      disabled={isLoading}
                      hideFormButton={true}
                      dataTestid="membership"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entityNames"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.auditLog.fields.entityNames}
                    </FormLabel>
                    <TagsInput
                      dictionary={dictionary}
                      separator=","
                      disabled={isLoading}
                      onChange={field.onChange}
                      value={field.value}
                      dataTestid="entityNames"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.auditLog.fields.entityId}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.auditLog.fields.operations}
                    </FormLabel>
                    <SelectMultipleInput
                      options={Object.values(auditLogOperations).map(
                        (value) => ({
                          value,
                          label: enumeratorLabel(
                            dictionary.auditLog.enumerators.operation,
                            value,
                          ),
                        }),
                      )}
                      dictionary={dictionary}
                      disabled={isLoading}
                      onChange={field.onChange}
                      value={field.value}
                      dataTestid="operations"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.auditLog.fields.transactionId}
                    </FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.auditLog.fields.apiKey}</FormLabel>
                    <ApiKeyAutocompleteInput
                      context={context}
                      onChange={field.onChange}
                      value={field.value}
                      mode="memory"
                      isClearable={true}
                      disabled={isLoading}
                      dataTestid="apiKey"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiHttpResponseCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.auditLog.fields.apiHttpResponseCode}
                    </FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiEndpoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.auditLog.fields.apiEndpoint}
                    </FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
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
