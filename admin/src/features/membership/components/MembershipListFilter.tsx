import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuLoader2, LuSearch } from 'react-icons/lu';
import { RxReset } from 'react-icons/rx';
import { MembershipStatus } from 'src/features/membership/MembershipStatus';
import { membershipFilterFormSchema } from 'src/features/membership/membershipSchemas';
import { roles } from 'src/features/roles';
import { cn } from 'src/shared/components/cn';
import FilterPreview from 'src/shared/components/dataTable/DataTableFilterPreview';
import { DataTableQueryParams } from 'src/shared/components/dataTable/DataTableQueryParams';
import { dataTableFilterRenders } from 'src/shared/components/dataTable/dataTableFilterRenders';
import SelectMultipleInput from 'src/shared/components/form/SelectMultipleInput';
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
  fullName: '',
  email: '',
  roles: [],
  statuses: [],
};

function MembershipListFilter({
  context,
  isLoading,
}: {
  context: AppContext;
  isLoading: boolean;
}) {
  const { dictionary } = context;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  z.setErrorMap(getZodErrorMap(context.locale));

  const previewRenders = {
    fullName: {
      label: dictionary.membership.fields.fullName,
    },
    email: {
      label: dictionary.membership.fields.email,
    },
    roles: {
      label: dictionary.membership.fields.roles,
      render: dataTableFilterRenders(context).enumeratorMultiple(
        dictionary.membership.enumerators.roles,
      ),
    },
    statuses: {
      label: dictionary.membership.fields.status,
      render: dataTableFilterRenders(context).enumeratorMultiple(
        dictionary.membership.enumerators.status,
      ),
    },
  };

  const filter = useMemo(
    () =>
      DataTableQueryParams.getFilter<
        z.infer<typeof membershipFilterFormSchema>
      >(searchParams, membershipFilterFormSchema),
    [searchParams],
  );

  const form = useForm({
    resolver: zodResolver(membershipFilterFormSchema),
    mode: 'onSubmit',
    defaultValues: filter,
  });

  useEffect(() => {
    form.reset({ ...emptyValues, ...filter } as z.infer<
      typeof membershipFilterFormSchema
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.membership.fields.email}</FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.membership.fields.fullName}
                    </FormLabel>
                    <Input disabled={isLoading} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.membership.fields.roles}</FormLabel>
                    <SelectMultipleInput
                      options={Object.keys(roles).map((value) => ({
                        value,
                        label: enumeratorLabel(
                          dictionary.membership.enumerators.roles,
                          value,
                        ),
                      }))}
                      dictionary={dictionary}
                      disabled={isLoading}
                      onChange={field.onChange}
                      value={field.value}
                      dataTestid="roles"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statuses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.membership.fields.status}</FormLabel>
                    <SelectMultipleInput
                      options={MembershipStatus.asList.map((value) => ({
                        value,
                        label: enumeratorLabel(
                          dictionary.membership.enumerators.status,
                          value,
                        ),
                      }))}
                      dictionary={dictionary}
                      disabled={isLoading}
                      onChange={field.onChange}
                      value={field.value}
                      dataTestid="statuses"
                    />
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

export default MembershipListFilter;
