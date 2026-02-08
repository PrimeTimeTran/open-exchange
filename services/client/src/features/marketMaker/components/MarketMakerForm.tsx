import { zodResolver } from '@hookform/resolvers/zod';
import { MarketMaker } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { MarketMakerWithRelationships } from 'src/features/marketMaker/marketMakerSchemas';
import {
  marketMakerCreateApiCall,
  marketMakerUpdateApiCall,
} from 'src/features/marketMaker/marketMakerApiCalls';
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
import { marketMakerCreateInputSchema } from 'src/features/marketMaker/marketMakerSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { marketMakerEnumerators } from 'src/features/marketMaker/marketMakerEnumerators';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { RadioGroup, RadioGroupItem } from 'src/shared/components/ui/radio-group';
import { Switch } from 'src/shared/components/ui/switch';
import DateTimePickerInput from 'src/shared/components/form/DateTimePickerInput';
import { Textarea } from 'src/shared/components/ui/textarea';
import SelectInput from 'src/shared/components/form/SelectInput';

export function MarketMakerForm({
  marketMaker,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (marketMaker: MarketMakerWithRelationships) => void;
  marketMaker?: Partial<MarketMakerWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(marketMaker?.id);

  const [initialValues] = React.useState({
    organizationName: marketMaker?.organizationName || '',
    contactEmail: marketMaker?.contactEmail || '',
    contactPhone: marketMaker?.contactPhone || '',
    status: marketMaker?.status || null,
    tier: marketMaker?.tier || null,
    marketsSupported: marketMaker?.marketsSupported || '',
    minQuoteSize: marketMaker?.minQuoteSize || '',
    maxQuoteSize: marketMaker?.maxQuoteSize || '',
    spreadLimit: marketMaker?.spreadLimit || '',
    quoteObligation: marketMaker?.quoteObligation || false,
    dailyVolumeTarget: marketMaker?.dailyVolumeTarget || '',
    makerFee: marketMaker?.makerFee || '',
    takerFee: marketMaker?.takerFee || '',
    rebateRate: marketMaker?.rebateRate || '',
    rebateBalance: marketMaker?.rebateBalance || '',
    apiAccess: marketMaker?.apiAccess || false,
    maxOrdersPerSecond: marketMaker?.maxOrdersPerSecond || '',
    directMarketAccess: marketMaker?.directMarketAccess || false,
    contractSignedAt: marketMaker?.contractSignedAt || '',
    obligationViolationCount: marketMaker?.obligationViolationCount || '',
    auditLog: marketMaker?.auditLog?.toString() || '',
    notesInternal: marketMaker?.notesInternal || '',
    specialOrderTypes: marketMaker?.specialOrderTypes || null,
    minFeeAmount: marketMaker?.minFeeAmount ? Number(marketMaker?.minFeeAmount) : '',
  });

  const form = useForm({
    resolver: zodResolver(marketMakerCreateInputSchema),
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
    mutationFn: (data: z.input<typeof marketMakerCreateInputSchema>) => {
      if (marketMaker?.id) {
        return marketMakerUpdateApiCall(marketMaker.id, data);
      } else {
        return marketMakerCreateApiCall(data);
      }
    },
    onSuccess: (marketMaker: MarketMaker) => {
      queryClient.invalidateQueries({
        queryKey: ['marketMaker'],
      });

      onSuccess(marketMaker);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.marketMaker.edit.success
          : dictionary.marketMaker.new.success,
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
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">
                    {dictionary.marketMaker.fields.organizationName}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
          {...field}
                  />

                  {dictionary.marketMaker.hints.organizationName ? (
                    <FormDescription>
                      {dictionary.marketMaker.hints.organizationName}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="organizationName-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.marketMaker.fields.contactEmail}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.marketMaker.hints.contactEmail ? (
                    <FormDescription>
                      {dictionary.marketMaker.hints.contactEmail}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="contactEmail-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.marketMaker.fields.contactPhone}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.marketMaker.hints.contactPhone ? (
                    <FormDescription>
                      {dictionary.marketMaker.hints.contactPhone}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="contactPhone-error" />
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
                  <FormLabel>{dictionary.marketMaker.fields.status}</FormLabel>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      className="flex flex-col space-y-1"
                      disabled={mutation.isPending || mutation.isSuccess}
                    >
                      {Object.keys(marketMakerEnumerators.status).map(
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
                                dictionary.marketMaker.enumerators.status,
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

                  {dictionary.marketMaker.hints.status ? (
                    <FormDescription>
                      {dictionary.marketMaker.hints.status}
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
              name="tier"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{dictionary.marketMaker.fields.tier}</FormLabel>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      className="flex flex-col space-y-1"
                      disabled={mutation.isPending || mutation.isSuccess}
                    >
                      {Object.keys(marketMakerEnumerators.tier).map(
                        (tier) => (
                          <FormItem
                            key={tier}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={tier} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {enumeratorLabel(
                                dictionary.marketMaker.enumerators.tier,
                                tier,
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

                  {dictionary.marketMaker.hints.tier ? (
                    <FormDescription>
                      {dictionary.marketMaker.hints.tier}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="tier-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="marketsSupported"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.marketMaker.fields.marketsSupported}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.marketMaker.hints.marketsSupported ? (
                    <FormDescription>
                      {dictionary.marketMaker.hints.marketsSupported}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="marketsSupported-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="minQuoteSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.marketMaker.fields.minQuoteSize}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.marketMaker.hints.minQuoteSize ? (
                      <FormDescription>
                        {dictionary.marketMaker.hints.minQuoteSize}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="minQuoteSize-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="maxQuoteSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.marketMaker.fields.maxQuoteSize}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.marketMaker.hints.maxQuoteSize ? (
                      <FormDescription>
                        {dictionary.marketMaker.hints.maxQuoteSize}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="maxQuoteSize-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="spreadLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.marketMaker.fields.spreadLimit}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.marketMaker.hints.spreadLimit ? (
                      <FormDescription>
                        {dictionary.marketMaker.hints.spreadLimit}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="spreadLimit-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="quoteObligation"
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
                      {dictionary.marketMaker.fields.quoteObligation}
                    </FormLabel>
                  </div>

                  {dictionary.marketMaker.hints.quoteObligation ? (
                    <FormDescription>
                      {dictionary.marketMaker.hints.quoteObligation}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="quoteObligation-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="dailyVolumeTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.marketMaker.fields.dailyVolumeTarget}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.marketMaker.hints.dailyVolumeTarget ? (
                      <FormDescription>
                        {dictionary.marketMaker.hints.dailyVolumeTarget}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="dailyVolumeTarget-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="makerFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.marketMaker.fields.makerFee}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.marketMaker.hints.makerFee ? (
                      <FormDescription>
                        {dictionary.marketMaker.hints.makerFee}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="makerFee-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="takerFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.marketMaker.fields.takerFee}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.marketMaker.hints.takerFee ? (
                      <FormDescription>
                        {dictionary.marketMaker.hints.takerFee}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="takerFee-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="rebateRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.marketMaker.fields.rebateRate}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.marketMaker.hints.rebateRate ? (
                      <FormDescription>
                        {dictionary.marketMaker.hints.rebateRate}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="rebateRate-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="rebateBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.marketMaker.fields.rebateBalance}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.marketMaker.hints.rebateBalance ? (
                      <FormDescription>
                        {dictionary.marketMaker.hints.rebateBalance}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="rebateBalance-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="apiAccess"
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
                      {dictionary.marketMaker.fields.apiAccess}
                    </FormLabel>
                  </div>

                  {dictionary.marketMaker.hints.apiAccess ? (
                    <FormDescription>
                      {dictionary.marketMaker.hints.apiAccess}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="apiAccess-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="maxOrdersPerSecond"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.marketMaker.fields.maxOrdersPerSecond}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.marketMaker.hints.maxOrdersPerSecond ? (
                      <FormDescription>
                        {dictionary.marketMaker.hints.maxOrdersPerSecond}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="maxOrdersPerSecond-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="directMarketAccess"
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
                      {dictionary.marketMaker.fields.directMarketAccess}
                    </FormLabel>
                  </div>

                  {dictionary.marketMaker.hints.directMarketAccess ? (
                    <FormDescription>
                      {dictionary.marketMaker.hints.directMarketAccess}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="directMarketAccess-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="contractSignedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.marketMaker.fields.contractSignedAt}
                  </FormLabel>

                  <div>
                    <DateTimePickerInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      disabled={mutation.isPending || mutation.isSuccess}
                      isClearable={true}
                    />
                  </div>

                  {dictionary.marketMaker.hints.contractSignedAt ? (
                    <FormDescription>
                      {dictionary.marketMaker.hints.contractSignedAt}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="contractSignedAt-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="obligationViolationCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.marketMaker.fields.obligationViolationCount}
                    </FormLabel>

                    <Input
                      type="number"
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.marketMaker.hints.obligationViolationCount ? (
                      <FormDescription>
                        {dictionary.marketMaker.hints.obligationViolationCount}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="obligationViolationCount-error" />
                  </FormItem>
                )}
              />
            </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="auditLog"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.marketMaker.fields.auditLog}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.marketMaker.hints.auditLog ? (
                    <FormDescription>
                      {dictionary.marketMaker.hints.auditLog}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="auditLog-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="notesInternal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.marketMaker.fields.notesInternal}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.marketMaker.hints.notesInternal ? (
                    <FormDescription>
                      {dictionary.marketMaker.hints.notesInternal}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="notesInternal-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
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
                  disabled={mutation.isPending || mutation.isSuccess}
                  onChange={field.onChange}
                  value={field.value}
                />

                {dictionary.marketMaker.hints.specialOrderTypes ? (
                  <FormDescription>
                    {dictionary.marketMaker.hints.specialOrderTypes}
                  </FormDescription>
                ) : null}

                <FormMessage data-testid="specialOrderTypes-error" />
              </FormItem>
            )}
          />
          </div>
          <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="minFeeAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.marketMaker.fields.minFeeAmount}
                    </FormLabel>

                    <Input
                      disabled={mutation.isPending || mutation.isSuccess}
                      {...field}
                    />

                    {dictionary.marketMaker.hints.minFeeAmount ? (
                      <FormDescription>
                        {dictionary.marketMaker.hints.minFeeAmount}
                      </FormDescription>
                    ) : null}

                    <FormMessage data-testid="minFeeAmount-error" />
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
