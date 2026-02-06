import { zodResolver } from '@hookform/resolvers/zod';
import { Candidate } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { CandidateWithRelationships } from 'src/features/candidate/candidateSchemas';
import {
  candidateCreateApiCall,
  candidateUpdateApiCall,
} from 'src/features/candidate/candidateApiCalls';
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
import { candidateCreateInputSchema } from 'src/features/candidate/candidateSchemas';
import { useSetUnsavedChanges } from 'src/shared/components/unsavedChanges/UnsavedChangesProvider';
import { Input } from 'src/shared/components/ui/input';
import { FilesInput } from 'src/features/file/components/FilesInput';
import { storage } from 'src/features/storage';
import { Textarea } from 'src/shared/components/ui/textarea';

export function CandidateForm({
  candidate,
  context,
  onSuccess,
  onCancel,
}: {
  onCancel: () => void;
  onSuccess: (candidate: CandidateWithRelationships) => void;
  candidate?: Partial<CandidateWithRelationships>;
  context: AppContext;
}) {
  const { locale, dictionary } = context;

  const queryClient = useQueryClient();
  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges();

  z.setErrorMap(getZodErrorMap(locale));

  const isEditing = Boolean(candidate?.id);

  const [initialValues] = React.useState({
    firstName: candidate?.firstName || '',
    lastName: candidate?.lastName || '',
    preferredName: candidate?.preferredName || '',
    email: candidate?.email || '',
    phone: candidate?.phone || '',
    country: candidate?.country || '',
    timezone: candidate?.timezone || '',
    linkedinUrl: candidate?.linkedinUrl || '',
    githubUrl: candidate?.githubUrl || '',
    portfolioUrl: candidate?.portfolioUrl || '',
    resumeUrl: candidate?.resumeUrl || '',
    resume: candidate?.resume || [],
    meta: candidate?.meta?.toString() || '',
  });

  const form = useForm({
    resolver: zodResolver(candidateCreateInputSchema),
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
    mutationFn: (data: z.input<typeof candidateCreateInputSchema>) => {
      if (candidate?.id) {
        return candidateUpdateApiCall(candidate.id, data);
      } else {
        return candidateCreateApiCall(data);
      }
    },
    onSuccess: (candidate: Candidate) => {
      queryClient.invalidateQueries({
        queryKey: ['candidate'],
      });

      onSuccess(candidate);
      clearUnsavedChanges();

      toast({
        description: isEditing
          ? dictionary.candidate.edit.success
          : dictionary.candidate.new.success,
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
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.candidate.fields.firstName}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    autoFocus
          {...field}
                  />

                  {dictionary.candidate.hints.firstName ? (
                    <FormDescription>
                      {dictionary.candidate.hints.firstName}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="firstName-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.candidate.fields.lastName}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.candidate.hints.lastName ? (
                    <FormDescription>
                      {dictionary.candidate.hints.lastName}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="lastName-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="preferredName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.candidate.fields.preferredName}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.candidate.hints.preferredName ? (
                    <FormDescription>
                      {dictionary.candidate.hints.preferredName}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="preferredName-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">
                    {dictionary.candidate.fields.email}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.candidate.hints.email ? (
                    <FormDescription>
                      {dictionary.candidate.hints.email}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="email-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.candidate.fields.phone}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.candidate.hints.phone ? (
                    <FormDescription>
                      {dictionary.candidate.hints.phone}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="phone-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.candidate.fields.country}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.candidate.hints.country ? (
                    <FormDescription>
                      {dictionary.candidate.hints.country}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="country-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.candidate.fields.timezone}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.candidate.hints.timezone ? (
                    <FormDescription>
                      {dictionary.candidate.hints.timezone}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="timezone-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.candidate.fields.linkedinUrl}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.candidate.hints.linkedinUrl ? (
                    <FormDescription>
                      {dictionary.candidate.hints.linkedinUrl}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="linkedinUrl-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="githubUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.candidate.fields.githubUrl}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.candidate.hints.githubUrl ? (
                    <FormDescription>
                      {dictionary.candidate.hints.githubUrl}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="githubUrl-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="portfolioUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.candidate.fields.portfolioUrl}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.candidate.hints.portfolioUrl ? (
                    <FormDescription>
                      {dictionary.candidate.hints.portfolioUrl}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="portfolioUrl-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="resumeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.candidate.fields.resumeUrl}
                  </FormLabel>

                  <Input
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.candidate.hints.resumeUrl ? (
                    <FormDescription>
                      {dictionary.candidate.hints.resumeUrl}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="resumeUrl-error" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid max-w-lg gap-1">
            <FormField
              control={form.control}
              name="resume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {dictionary.candidate.fields.resume}
                  </FormLabel>

                  <div>
                    <FilesInput
                      onChange={field.onChange}
                      value={field.value}
                      dictionary={dictionary}
                      storage={storage.candidateResume}
                      disabled={mutation.isPending || mutation.isSuccess}
                    />
                  </div>

                  {dictionary.candidate.hints.resume ? (
                    <FormDescription>
                      {dictionary.candidate.hints.resume}
                    </FormDescription>
                  ) : null}

                  <FormMessage data-testid="resume-error" />
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
                    {dictionary.candidate.fields.meta}
                  </FormLabel>

                  <Textarea
                    disabled={mutation.isPending || mutation.isSuccess}
                    {...field}
                  />

                  {dictionary.candidate.hints.meta ? (
                    <FormDescription>
                      {dictionary.candidate.hints.meta}
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
