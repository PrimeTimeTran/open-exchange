'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { useForm } from 'react-hook-form';
import { authPasswordResetRequestApiCall } from 'src/features/auth/authApiCalls';
import { cn } from 'src/shared/components/cn';
import { Button } from 'src/shared/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'src/shared/components/ui/form';
import { Input } from 'src/shared/components/ui/input';
import { toast } from 'src/shared/components/ui/use-toast';
import { getZodErrorMap } from 'src/translation/getZodErrorMap';
import { Dictionary, Locale } from 'src/translation/locales';
import { z } from 'zod';

interface PasswordResetRequestFormProps {
  locale: Locale;
  dictionary: Dictionary;
}

function PasswordResetRequestForm({
  locale,
  dictionary,
}: PasswordResetRequestFormProps) {
  const router = useRouter();

  z.setErrorMap(getZodErrorMap(locale));

  const schema = z.object({
    email: z.string().min(1).email(),
    recaptchaToken: z.string().optional(),
  });

  const [initialValues] = React.useState({
    email: '',
  });

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) => {
      return authPasswordResetRequestApiCall(data.email, data.recaptchaToken);
    },
    onSuccess: () => {
      router.push('/');

      toast({
        title: dictionary.auth.passwordResetRequest.success,
      });
    },
    onError: (error: Error) => {
      form.setError('email', {
        message: error.message || dictionary.shared.errors.unknown,
      });
    },
  });

  const { executeRecaptcha } = useGoogleReCaptcha();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const isRecaptchaEnabled = Boolean(
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    );

    if (!isRecaptchaEnabled) {
      mutation.mutateAsync(data);
      return;
    }

    if (!executeRecaptcha) {
      return;
    }

    mutation.mutateAsync({ ...data, recaptchaToken: await executeRecaptcha() });
  };

  return (
    <div className={cn('grid gap-6')}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {dictionary.auth.passwordResetRequest.email}
                    </FormLabel>
                    <Input
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={mutation.isPending || mutation.isSuccess}
                      autoFocus
                      {...field}
                    />
                    <FormMessage data-testid="email-error" />
                  </FormItem>
                )}
              />
            </div>
            <Button
              className="mt-2"
              disabled={mutation.isPending || mutation.isSuccess}
              type="submit"
            >
              {(mutation.isPending || mutation.isSuccess) && (
                <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {dictionary.auth.passwordResetRequest.button}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export function PasswordResetRequestFormWithRecaptcha(
  props: PasswordResetRequestFormProps,
) {
  if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    return <PasswordResetRequestForm {...props} />;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
    >
      <PasswordResetRequestForm {...props} />
    </GoogleReCaptchaProvider>
  );
}
