import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuLoader2, LuSearch } from 'react-icons/lu';
import { RxReset } from 'react-icons/rx';
import { jobFilterFormSchema } from 'src/features/job/jobSchemas';
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
import { jobEnumerators } from 'src/features/job/jobEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import SelectInput from 'src/shared/components/form/SelectInput';
import RangeInput from 'src/shared/components/form/RangeInput';
import { Switch } from 'src/shared/components/ui/switch';

const emptyValues = {
  title: '',
  team: '',
  location: '',
  type: null,
  remote: '',
  description: '',
  requirements: '',
  responsibilities: '',
  quantityRange: [],
  salaryLowRange: [],
  salaryHighRange: [],
  status: null,
  seniority: null,
  currency: '',
  archived: false,
};

function JobListFilter({
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
    title: {
      label: dictionary.job.fields.title,
    },
    team: {
      label: dictionary.job.fields.team,
    },
    location: {
      label: dictionary.job.fields.location,
    },
    type: {
      label: dictionary.job.fields.type,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.job.enumerators.type,
      ),
    },
    remote: {
      label: dictionary.job.fields.remote,
      render: dataTableFilterRenders(context).boolean(),
    },
    description: {
      label: dictionary.job.fields.description,
    },
    requirements: {
      label: dictionary.job.fields.requirements,
    },
    responsibilities: {
      label: dictionary.job.fields.responsibilities,
    },
    quantityRange: {
      label: dictionary.job.fields.quantity,
      render: dataTableFilterRenders(context).range(),
    },
    salaryLowRange: {
      label: dictionary.job.fields.salaryLow,
      render: dataTableFilterRenders(context).range(),
    },
    salaryHighRange: {
      label: dictionary.job.fields.salaryHigh,
      render: dataTableFilterRenders(context).range(),
    },
    status: {
      label: dictionary.job.fields.status,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.job.enumerators.status,
      ),
    },
    seniority: {
      label: dictionary.job.fields.seniority,
      render: dataTableFilterRenders(context).enumerator(
        dictionary.job.enumerators.seniority,
      ),
    },
    currency: {
      label: dictionary.job.fields.currency,
    },
    archived: {
      label: dictionary.shared.showArchived,
      render: dataTableFilterRenders(context).booleanTrueOnly(),
    },
  };

  const filter = useMemo(
    () =>
      DataTableQueryParams.getFilter<z.infer<typeof jobFilterFormSchema>>(
        searchParams,
        jobFilterFormSchema,
      ),
    [searchParams],
  );

  const form = useForm({
    resolver: zodResolver(jobFilterFormSchema),
    mode: 'onSubmit',
    defaultValues: filter,
  });

  useEffect(() => {
    form.reset({ ...emptyValues, ...filter } as z.infer<
      typeof jobFilterFormSchema
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.job.fields.title}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.job.fields.team}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.job.fields.location}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.job.fields.type}</FormLabel>
                    <SelectInput
                      options={Object.keys(jobEnumerators.type).map(
                        (value) => ({
                          value,
                          label: enumeratorLabel(
                            dictionary.job.enumerators.type,
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
                name="remote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.job.fields.remote}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.job.fields.description}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.job.fields.requirements}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsibilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.job.fields.responsibilities}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantityRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.job.fields.quantity}</FormLabel>
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
                name="salaryLowRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.job.fields.salaryLow}</FormLabel>
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
                name="salaryHighRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.job.fields.salaryHigh}</FormLabel>
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
                    <FormLabel>{dictionary.job.fields.status}</FormLabel>
                    <SelectInput
                      options={Object.keys(jobEnumerators.status).map(
                        (value) => ({
                          value,
                          label: enumeratorLabel(
                            dictionary.job.enumerators.status,
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
                name="seniority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.job.fields.seniority}</FormLabel>
                    <SelectInput
                      options={Object.keys(jobEnumerators.seniority).map(
                        (value) => ({
                          value,
                          label: enumeratorLabel(
                            dictionary.job.enumerators.seniority,
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
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.job.fields.currency}</FormLabel>
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

export default JobListFilter;

