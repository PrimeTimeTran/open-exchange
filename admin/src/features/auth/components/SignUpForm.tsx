'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { useForm } from 'react-hook-form';
import { authSignUpApiCall } from 'src/features/auth/authApiCalls';
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

interface SignUpFormProps {
  locale: Locale;
  dictionary: Dictionary;
}

function SignUpForm({ locale, dictionary }: SignUpFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const invitationToken = searchParams.get('invitationToken');
  const email = searchParams.get('email');
  z.setErrorMap(getZodErrorMap(locale));

  const schema = z.object({
    email: z.string().min(1).email(),
    password: z.string().min(8),
    recaptchaToken: z.string().optional(),
  });

  const [initialValues] = React.useState({
    email: email || '',
    password: '',
  });

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) => {
      return authSignUpApiCall(
        data.email,
        data.password,
        invitationToken,
        data.recaptchaToken,
      );
    },
    onSuccess: () => {
      router.push(`/`);

      toast({
        title: dictionary.auth.signUp.success,
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
                    <FormLabel>{dictionary.auth.signUp.email}</FormLabel>
                    <Input
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={mutation.isPending || mutation.isSuccess}
                      autoFocus={!Boolean(email)}
                      {...field}
                    />
                    <FormMessage data-testid="email-error" />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-1">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.auth.signUp.password}</FormLabel>
                    <Input
                      type="password"
                      disabled={mutation.isPending || mutation.isSuccess}
                      autoFocus={Boolean(email)}
                      {...field}
                    />
                    <FormMessage data-testid="password-error" />
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
              {dictionary.auth.signUp.button}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export function SignUpFormWithRecaptcha(props: SignUpFormProps) {
  if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    return <SignUpForm {...props} />;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
    >
      <SignUpForm {...props} />
    </GoogleReCaptchaProvider>
  );
}
