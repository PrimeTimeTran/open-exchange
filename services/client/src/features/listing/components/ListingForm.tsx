import { zodResolver } from '@hookform/resolvers/zod';
import { Listing } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { ListingWithRelationships } from 'src/features/listing/listingSchemas';
import {
  listingCreateApiCall,
  listingUpdateApiCall,
} from 'src/features/listing/listingApiCalls';
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
import { listingCreateInputSchema } from 'src/features/listing/listingSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import DatePickerInput from 'src/shared/components/form/DatePickerInput';
import { listingEnumerators } from 'src/features/listing/listingEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { RadioGroup, RadioGroupItem } from 'src/shared/components/ui/radio-group';
import { Switch } from 'src/shared/components/ui/switch';
import { Textarea } from 'src/shared/components/ui/textarea';

export function ListingForm({
  listing,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (listing: ListingWithRelationships) => void;
  listing?: Partial<ListingWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(listing?.id);

  const [initialValues] = React.useState({
    companyName: listing?.companyName || '',
    legalName: listing?.legalName || '',
    jurisdiction: listing?.jurisdiction || '',
    incorporationDate: listing?.incorporationDate || '',
    website: listing?.website || '',
    assetSymbol: listing?.assetSymbol || '',
    assetClass: listing?.assetClass || null,
    status: listing?.status || null,
    submittedAt: listing?.submittedAt || '',
    decisionAt: listing?.decisionAt || '',
    kycCompleted: listing?.kycCompleted || false,
    docsSubmitted: listing?.docsSubmitted || false,
    riskDisclosureUrl: listing?.riskDisclosureUrl || '',
    primaryContactName: listing?.primaryContactName || '',
    primaryContactEmail: listing?.primaryContactEmail || '',
    reviewedBy: listing?.reviewedBy || '',
    notes: listing?.notes || '',
    meta: listing?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(listingCreateInputSchema),
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
    mutationFn: (data: z.input<typeof listingCreateInputSchema>) => {
      if (listing?.id) {
        return listingUpdateApiCall(listing.id, data);
      } else {
        return listingCreateApiCall(data);
      }
    },
    onSuccess: (listing: Listing) => {
      queryClient.invalidateQueries({
        queryKey: ['listing'],
      });

      onSuccess(listing);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.listing.edit.success
          : dictionary.listing.new.success,
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
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.listing.fields.companyName}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
          {...field}
                  />

                  {dictionary.listing.hints.companyName ? (
                    <FormDescription>
                      {dictionary.listing.hints.companyName}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="companyName-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="legalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.listing.fields.legalName}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.listing.hints.legalName ? (
                    <FormDescription>
                      {dictionary.listing.hints.legalName}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="legalName-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="jurisdiction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.listing.fields.jurisdiction}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.listing.hints.jurisdiction ? (
                    <FormDescription>
                      {dictionary.listing.hints.jurisdiction}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="jurisdiction-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="incorporationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.listing.fields.incorporationDate}
                  </FormLabel>

                  <div>
                    <DatePickerInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      disabled={mutation.isPending || mutation.isSuccess}
                      isClearable={true}
                    />
                  </div>

                  {dictionary.listing.hints.incorporationDate ? (
                    <FormDescription>
                      {dictionary.listing.hints.incorporationDate}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="incorporationDate-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.listing.fields.website}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.listing.hints.website ? (
                    <FormDescription>
                      {dictionary.listing.hints.website}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="website-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="assetSymbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">
                    {dictionary.listing.fields.assetSymbol}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.listing.hints.assetSymbol ? (
                    <FormDescription>
                      {dictionary.listing.hints.assetSymbol}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="assetSymbol-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="assetClass"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{dictionary.listing.fields.assetClass}</FormLabel>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      className="flex flex-col space-y-1"
                      disabled={mutation.isPending || mutation.isSuccess}
                    >
                      {Object.keys(listingEnumerators.assetClass).map(
                        (assetClass) => (
                          <FormItem
                            key={assetClass}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={assetClass} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {enumeratorLabel(
                                dictionary.listing.enumerators.assetClass,
                                assetClass,
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

                  {dictionary.listing.hints.assetClass ? (
                    <FormDescription>
                      {dictionary.listing.hints.assetClass}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="assetClass-error" />
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
                  <FormLabel>{dictionary.listing.fields.status}</FormLabel>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      className="flex flex-col space-y-1"
                      disabled={mutation.isPending || mutation.isSuccess}
                    >
                      {Object.keys(listingEnumerators.status).map(
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
                                dictionary.listing.enumerators.status,
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

                  {dictionary.listing.hints.status ? (
                    <FormDescription>
                      {dictionary.listing.hints.status}
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
              name="submittedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.listing.fields.submittedAt}
                  </FormLabel>

                  <div>
                    <DatePickerInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      disabled={mutation.isPending || mutation.isSuccess}
                      isClearable={true}
                    />
                  </div>

                  {dictionary.listing.hints.submittedAt ? (
                    <FormDescription>
                      {dictionary.listing.hints.submittedAt}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="submittedAt-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="decisionAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.listing.fields.decisionAt}
                  </FormLabel>

                  <div>
                    <DatePickerInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      disabled={mutation.isPending || mutation.isSuccess}
                      isClearable={true}
                    />
                  </div>

                  {dictionary.listing.hints.decisionAt ? (
                    <FormDescription>
                      {dictionary.listing.hints.decisionAt}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="decisionAt-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="kycCompleted"
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
                      {dictionary.listing.fields.kycCompleted}
                    </FormLabel>
                  </div>

                  {dictionary.listing.hints.kycCompleted ? (
                    <FormDescription>
                      {dictionary.listing.hints.kycCompleted}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="kycCompleted-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="docsSubmitted"
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
                      {dictionary.listing.fields.docsSubmitted}
                    </FormLabel>
                  </div>

                  {dictionary.listing.hints.docsSubmitted ? (
                    <FormDescription>
                      {dictionary.listing.hints.docsSubmitted}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="docsSubmitted-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="riskDisclosureUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.listing.fields.riskDisclosureUrl}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.listing.hints.riskDisclosureUrl ? (
                    <FormDescription>
                      {dictionary.listing.hints.riskDisclosureUrl}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="riskDisclosureUrl-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="primaryContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.listing.fields.primaryContactName}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.listing.hints.primaryContactName ? (
                    <FormDescription>
                      {dictionary.listing.hints.primaryContactName}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="primaryContactName-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="primaryContactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.listing.fields.primaryContactEmail}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.listing.hints.primaryContactEmail ? (
                    <FormDescription>
                      {dictionary.listing.hints.primaryContactEmail}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="primaryContactEmail-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="reviewedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.listing.fields.reviewedBy}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.listing.hints.reviewedBy ? (
                    <FormDescription>
                      {dictionary.listing.hints.reviewedBy}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="reviewedBy-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.listing.fields.notes}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.listing.hints.notes ? (
                    <FormDescription>
                      {dictionary.listing.hints.notes}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="notes-error" />
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
                    {dictionary.listing.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.listing.hints.meta ? (
                    <FormDescription>
                      {dictionary.listing.hints.meta}
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
