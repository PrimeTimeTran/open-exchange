import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startCase, uniq } from 'lodash';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { LuLoader2 } from 'react-icons/lu';
import {
  apiKeyCreateApiCall,
  apiKeyUpdateApiCall,
} from 'src/features/apiKey/apiKeyApiCalls';
import {
  ApiKeyWithMembership,
  apiKeyCreateInputSchema,
  apiKeyUpdateInputSchema,
} from 'src/features/apiKey/apiKeySchemas';
import { availablePermissions } from 'src/features/permissions';
import DateTimePickerInput from 'src/shared/components/form/DateTimePickerInput';
import SelectMultipleInput from 'src/shared/components/form/SelectMultipleInput';
import { Button } from 'src/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'src/shared/components/ui/form';
import { Input } from 'src/shared/components/ui/input';
import { Switch } from 'src/shared/components/ui/switch';
import { toast } from 'src/shared/components/ui/use-toast';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { AppContext } from 'src/shared/controller/appContext';
import { getZodErrorMap } from 'src/translation/getZodErrorMap';
import { z } from 'zod';

export function ApiKeyForm({
  apiKey,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (apiKey: unknown) => void;
  apiKey?: Partial<ApiKeyWithMembership>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  const queryClient = useQueryClient();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(apiKey?.id);

  const [initialValues] = React.useState({
    name: apiKey?.name || '',
    scopes: apiKey?.scopes || [],
    expiresAt: apiKey?.expiresAt || null,
    disabled: Boolean(apiKey?.disabledAt),
  });

  const availableScopes = uniq(
    availablePermissions(
      apiKey?.membership?.roles || context.currentMembership?.roles || [],
    ).map((permission) => permission.id),
  );

  const _apiKeyCreateInputSchema = apiKeyCreateInputSchema(
    availableScopes,
    context.dictionary,
  );

  const _apiKeyUpdateInputSchema = apiKeyUpdateInputSchema(
    availableScopes,
    context.dictionary,
  );

  const schema = isEditing
    ? _apiKeyUpdateInputSchema
    : _apiKeyCreateInputSchema;

  const form = useForm({
    resolver: zodResolver(schema),
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
    mutationFn: (data: z.input<typeof schema>) => {
      if (apiKey?.id) {
        return apiKeyUpdateApiCall(apiKey.id, data);
      } else {
        return apiKeyCreateApiCall(data);
      }
    },
    onSuccess: (apiKey: unknown) => {
      queryClient.invalidateQueries({
        queryKey: ['apiKey'],
      });

      clearUnsavedChanges();
      onSuccess(apiKey);

      toast({
        description: isEditing
          ? dictionary.apiKey.edit.success
          : dictionary.apiKey.new.success,
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">
                    {dictionary.apiKey.fields.name}
                  </FormLabel>
                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
                    {...field}
                  />
                  <FormMessage data-testid="name-error" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="scopes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">
                    {dictionary.apiKey.fields.scopes}
                  </FormLabel>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <SelectMultipleInput
                        options={availableScopes.map((value) => ({
                          value,
                          label: startCase(value),
                        }))}
                        dictionary={dictionary}
                        disabled={mutation.isPending || mutation.isSuccess}
                        onChange={field.onChange}
                        value={field.value}
                        dataTestid="scopes"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={() => field.onChange(availableScopes)}
                    >
                      {dictionary.apiKey.form.addAll}
                    </Button>
                  </div>
                  <FormMessage data-testid="scopes-error" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.apiKey.fields.expiresAt}</FormLabel>
                  <div>
                    <DateTimePickerInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      disabled={mutation.isPending || mutation.isSuccess}
                      isClearable={true}
                      dataTestid={'expiresAt'}
                    />
                  </div>
                  <FormMessage data-testid="expiresAt-error" />
                </FormItem>
              )}
            />
          </div>

          {isEditing ? (
            <div className="grid max-w-lg gap-1">
              <FormField
                control={form.control}
                name="disabled"
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
                      <FormLabel>{dictionary.apiKey.fields.disabled}</FormLabel>
                    </div>
                    <FormMessage data-testid="disabled-error" />
                  </FormItem>
                )}
              />
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button
              disabled={mutation.isPending || mutation.isSuccess}
              type="submit"
            >
              {(mutation.isPending || mutation.isSuccess) && (
                <LuLoader2 className="mr-2 size-4 animate-spin" />
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
