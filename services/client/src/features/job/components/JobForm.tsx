import { zodResolver } from '@hookform/resolvers/zod';
import { Job } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { JobWithRelationships } from 'src/features/job/jobSchemas';
import {
  jobCreateApiCall,
  jobUpdateApiCall,
} from 'src/features/job/jobApiCalls';
import { AppContext } from 'src/shared/controller/appContext';
import { Button } from 'src/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'src/shared/components/ui/form';
import { toast } from 'src/shared/components/ui/use-toast';
import { getZodErrorMap } from 'src/translation/getZodErrorMap';
import { z } from 'zod';
import { jobCreateInputSchema } from 'src/features/job/jobSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { jobEnumerators } from 'src/features/job/jobEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { RadioGroup, RadioGroupItem } from 'src/shared/components/ui/radio-group';
import { Switch } from 'src/shared/components/ui/switch';
import { Textarea } from 'src/shared/components/ui/textarea';

export function JobForm({
  job,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (job: JobWithRelationships) => void;
  job?: Partial<JobWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(job?.id);

  const [initialValues] = React.useState({
    title: job?.title || '',
    team: job?.team || '',
    location: job?.location || '',
    type: job?.type || null,
    remote: job?.remote || false,
    description: job?.description || '',
    requirements: job?.requirements || '',
    responsibilities: job?.responsibilities || '',
    quantity: job?.quantity || '',
    salaryLow: job?.salaryLow || '',
    salaryHigh: job?.salaryHigh || '',
    status: job?.status || null,
    seniority: job?.seniority || null,
    currency: job?.currency || '',
    meta: job?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(jobCreateInputSchema),
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  React.useEffect(() => {
    if (form.formState.isDirty) {
      setUnsavedChanges({
        message: dictionary.shared.unsavedChanges.message,
        dismissButtonLabel: dictionary.shared.unsavedChanges.dismiss,
        proceedLinkLabel: dictionary.shared.unsavedChanges.proceed,
        saveLabel: dictionary.shared.unsavedChanges.saveChanges,
        saveAction: () => form.handleSubmit(onSubmit)(),
      });
    } else {
      clearUnsavedChanges();
    }
  }, [form.formState.isDirty]);

  const mutation = useMutation({
    mutationFn: (data: z.input<typeof jobCreateInputSchema>) => {
      if (job?.id) {
        return jobUpdateApiCall(job.id, data);
      } else {
        return jobCreateApiCall(data);
      }
    },
    onSuccess: (job: Job) => {
      queryClient.invalidateQueries({
        queryKey: ['job'],
      });

      onSuccess(job);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.job.edit.success
          : dictionary.job.new.success,
      });
    },
    onError: (error: Error) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutateAsync(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
      >
        <div className="grid w-full gap-8">
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.job.fields.title}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
          {...field}
                  />

                  {dictionary.job.hints.title ? (
                    <FormDescription>
                      {dictionary.job.hints.title}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="title-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="team"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.job.fields.team}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.job.hints.team ? (
                    <FormDescription>
                      {dictionary.job.hints.team}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="team-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.job.fields.location}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.job.hints.location ? (
                    <FormDescription>
                      {dictionary.job.hints.location}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="location-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{dictionary.job.fields.type}</FormLabel>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      className="flex flex-col space-y-1"
                      disabled={mutation.isPending || mutation.isSuccess}
                    >
                      {Object.keys(jobEnumerators.type).map(
                        (type) => (
                          <FormItem
                            key={type}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={type} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {enumeratorLabel(
                                dictionary.job.enumerators.type,
                                type,
                              )}
                            </FormLabel>
                          </FormItem>
                        ),
                      )}
                    </RadioGroup>
                  </FormControl>

                  {Boolean(field.value) && (
                    <button
                      type="button"
                      className="mt-2 text-sm text-muted-foreground underline"
                      onClick={() => field.onChange(null)}
                    >
                      {dictionary.shared.clear}
                    </button>
                  )}

                  {dictionary.job.hints.type ? (
                    <FormDescription>
                      {dictionary.job.hints.type}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="type-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="remote"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={mutation.isPending || mutation.isSuccess}
                      />
                    </FormControl>
                    <FormLabel>
                      {dictionary.job.fields.remote}
                    </FormLabel>
                  </div>

                  {dictionary.job.hints.remote ? (
                    <FormDescription>
                      {dictionary.job.hints.remote}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="remote-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.job.fields.description}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.job.hints.description ? (
                    <FormDescription>
                      {dictionary.job.hints.description}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="description-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.job.fields.requirements}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.job.hints.requirements ? (
                    <FormDescription>
                      {dictionary.job.hints.requirements}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="requirements-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="responsibilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.job.fields.responsibilities}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.job.hints.responsibilities ? (
                    <FormDescription>
                      {dictionary.job.hints.responsibilities}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="responsibilities-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.job.fields.quantity}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.job.hints.quantity ? (
                      <FormDescription>
                        {dictionary.job.hints.quantity}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="quantity-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="salaryLow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.job.fields.salaryLow}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.job.hints.salaryLow ? (
                      <FormDescription>
                        {dictionary.job.hints.salaryLow}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="salaryLow-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="salaryHigh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.job.fields.salaryHigh}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.job.hints.salaryHigh ? (
                      <FormDescription>
                        {dictionary.job.hints.salaryHigh}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="salaryHigh-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{dictionary.job.fields.status}</FormLabel>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      className="flex flex-col space-y-1"
                      disabled={mutation.isPending || mutation.isSuccess}
                    >
                      {Object.keys(jobEnumerators.status).map(
                        (status) => (
                          <FormItem
                            key={status}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={status} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {enumeratorLabel(
                                dictionary.job.enumerators.status,
                                status,
                              )}
                            </FormLabel>
                          </FormItem>
                        ),
                      )}
                    </RadioGroup>
                  </FormControl>

                  {Boolean(field.value) && (
                    <button
                      type="button"
                      className="mt-2 text-sm text-muted-foreground underline"
                      onClick={() => field.onChange(null)}
                    >
                      {dictionary.shared.clear}
                    </button>
                  )}

                  {dictionary.job.hints.status ? (
                    <FormDescription>
                      {dictionary.job.hints.status}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="status-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="seniority"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{dictionary.job.fields.seniority}</FormLabel>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      className="flex flex-col space-y-1"
                      disabled={mutation.isPending || mutation.isSuccess}
                    >
                      {Object.keys(jobEnumerators.seniority).map(
                        (seniority) => (
                          <FormItem
                            key={seniority}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={seniority} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {enumeratorLabel(
                                dictionary.job.enumerators.seniority,
                                seniority,
                              )}
                            </FormLabel>
                          </FormItem>
                        ),
                      )}
                    </RadioGroup>
                  </FormControl>

                  {Boolean(field.value) && (
                    <button
                      type="button"
                      className="mt-2 text-sm text-muted-foreground underline"
                      onClick={() => field.onChange(null)}
                    >
                      {dictionary.shared.clear}
                    </button>
                  )}

                  {dictionary.job.hints.seniority ? (
                    <FormDescription>
                      {dictionary.job.hints.seniority}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="seniority-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.job.fields.currency}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.job.hints.currency ? (
                    <FormDescription>
                      {dictionary.job.hints.currency}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="currency-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="meta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.job.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.job.hints.meta ? (
                    <FormDescription>
                      {dictionary.job.hints.meta}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="meta-error" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2">
            <Button
              disabled={mutation.isPending || mutation.isSuccess}
              type="submit"
            >
              {(mutation.isPending || mutation.isSuccess) && (
                <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {dictionary.shared.save}
            </Button>

            <Button
              disabled={mutation.isPending || mutation.isSuccess}
              type="button"
              variant={'secondary'}
              onClick={() => {
                clearUnsavedChanges();
                onCancel();
              }}
            >
              {dictionary.shared.cancel}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
