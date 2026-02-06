import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuLoader2, LuSearch } from 'react-icons/lu';
import { RxReset } from 'react-icons/rx';
import { systemAccountFilterFormSchema } from 'src/features/systemAccount/systemAccountSchemas';
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
import { systemAccountEnumerators } from 'src/features/systemAccount/systemAccountEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import { Input } from 'src/shared/components/ui/input';
import { Switch } from 'src/shared/components/ui/switch';

const emptyValues = {
  type: null,
  name: '',
  description: '',
  isActive: '',
  archived: false,
};

function SystemAccountListFilter({
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
    type: {
      label: dictionary.systemAccount.fields.type,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.systemAccount.enumerators.type,
      ),
    },
    name: {
      label: dictionary.systemAccount.fields.name,
    },
    description: {
      label: dictionary.systemAccount.fields.description,
    },
    isActive: {
      label: dictionary.systemAccount.fields.isActive,
      render: dataTableFilterRenders(context).boolean(),
    },
    archived: {
      label: dictionary.shared.showArchived,
      render: dataTableFilterRenders(context).booleanTrueOnly(),
    },
  };

  const filter = useMemo(
    () =>
      DataTableQueryParams.getFilter<z.infer<typeof systemAccountFilterFormSchema>>(
        searchParams,
        systemAccountFilterFormSchema,
      ),
    [searchParams],
  );

  const form = useForm({
    resolver: zodResolver(systemAccountFilterFormSchema),
    mode: 'onSubmit',
    defaultValues: filter,
  });

  useEffect(() => {
    form.reset({ ...emptyValues, ...filter } as z.infer<
      typeof systemAccountFilterFormSchema
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.systemAccount.fields.type}</FormLabel>
                    <SelectInput
                      options={Object.keys(systemAccountEnumerators.type).map(
                        (value) => ({
                          value,
                          label: enumeratorLabel(
                            dictionary.systemAccount.enumerators.type,
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.systemAccount.fields.name}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.systemAccount.fields.description}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.systemAccount.fields.isActive}
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

export default SystemAccountListFilter;

