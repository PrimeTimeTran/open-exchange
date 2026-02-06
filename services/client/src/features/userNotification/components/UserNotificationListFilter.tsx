import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuLoader2, LuSearch } from 'react-icons/lu';
import { RxReset } from 'react-icons/rx';
import { userNotificationFilterFormSchema } from 'src/features/userNotification/userNotificationSchemas';
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
import DateTimePickerRangeInput from 'src/shared/components/form/DateTimePickerRangeInput';
import { userNotificationEnumerators } from 'src/features/userNotification/userNotificationEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import { Switch } from 'src/shared/components/ui/switch';

const emptyValues = {
  readAtRange: [],
  dismissedAtRange: [],
  acknowledgedAtRange: [],
  deliveryChannel: null,
  deliveredAtRange: [],
  notification: null,
  user: null,
  archived: false,
};

function UserNotificationListFilter({
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
    readAtRange: {
      label: dictionary.userNotification.fields.readAt,
      render: dataTableFilterRenders(context).dateTimeRange(),
    },
    dismissedAtRange: {
      label: dictionary.userNotification.fields.dismissedAt,
      render: dataTableFilterRenders(context).dateTimeRange(),
    },
    acknowledgedAtRange: {
      label: dictionary.userNotification.fields.acknowledgedAt,
      render: dataTableFilterRenders(context).dateTimeRange(),
    },
    deliveryChannel: {
      label: dictionary.userNotification.fields.deliveryChannel,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.userNotification.enumerators.deliveryChannel,
      ),
    },
    deliveredAtRange: {
      label: dictionary.userNotification.fields.deliveredAt,
      render: dataTableFilterRenders(context).dateTimeRange(),
    },
    archived: {
      label: dictionary.shared.showArchived,
      render: dataTableFilterRenders(context).booleanTrueOnly(),
    },
  };

  const filter = useMemo(
    () =>
      DataTableQueryParams.getFilter<z.infer<typeof userNotificationFilterFormSchema>>(
        searchParams,
        userNotificationFilterFormSchema,
      ),
    [searchParams],
  );

  const form = useForm({
    resolver: zodResolver(userNotificationFilterFormSchema),
    mode: 'onSubmit',
    defaultValues: filter,
  });

  useEffect(() => {
    form.reset({ ...emptyValues, ...filter } as z.infer<
      typeof userNotificationFilterFormSchema
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
                name="readAtRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.userNotification.fields.readAt}
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
                name="dismissedAtRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.userNotification.fields.dismissedAt}
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
                name="acknowledgedAtRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.userNotification.fields.acknowledgedAt}
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
                name="deliveryChannel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.userNotification.fields.deliveryChannel}</FormLabel>
                    <SelectInput
                      options={Object.keys(userNotificationEnumerators.deliveryChannel).map(
                        (value) => ({
                          value,
                          label: enumeratorLabel(
                            dictionary.userNotification.enumerators.deliveryChannel,
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
                name="deliveredAtRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.userNotification.fields.deliveredAt}
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

export default UserNotificationListFilter;

