'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LuLoader2 } from 'react-icons/lu';
import Link from 'src/shared/components/Link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { useForm } from 'react-hook-form';
import { FaFacebook, FaGithub, FaGoogle } from 'react-icons/fa';
import { authSignInApiCall } from 'src/features/auth/authApiCalls';
import { authFacebookOauthLink } from 'src/features/auth/authFacebookOauth';
import { authGithubOauthLink } from 'src/features/auth/authGithubOauth';
import { authGoogleOauthLink } from 'src/features/auth/authGoogleOauth';
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
import { Toaster } from 'src/shared/components/ui/toaster';
import { useToast } from 'src/shared/components/ui/use-toast';
import { getZodErrorMap } from 'src/translation/getZodErrorMap';
import { Dictionary, Locale } from 'src/translation/locales';
import { z } from 'zod';

interface SignInFormProps {
  locale: Locale;
  dictionary: Dictionary;
}

function SignInForm({ locale, dictionary }: SignInFormProps) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const oauthError = searchParams.get('oauthError');
  const router = useRouter();
  const { toast } = useToast();

  z.setErrorMap(getZodErrorMap(locale));

  const schema = z.object({
    email: z.string().transform(value => value.replace(/\s+/g, '')).pipe(z.string().min(1).email()),
    password: z.string().min(8),
    recaptchaToken: z.string().optional(),
  });

  const [initialValues] = React.useState({
    email: '',
    password: '',
  });

  React.useEffect(() => {
    if (oauthError) {
      router.replace('/auth/sign-in');

      toast({
        description: dictionary.auth.signIn.oauthError,
        itemID: 'oauthError',
        variant: 'destructive',
      });
    }
  }, [oauthError, router, toast, dictionary]);

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) => {
      return authSignInApiCall(data.email, data.password, data.recaptchaToken);
    },
    onSuccess: () => {
      if (redirect) {
        router.push(redirect);
      } else {
        router.push('/');
      }

      toast({
        title: dictionary.auth.signIn.success,
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
                    <FormLabel>{dictionary.auth.signIn.email}</FormLabel>
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
            <div className="grid gap-1">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-end justify-between">
                      <FormLabel>{dictionary.auth.signIn.password}</FormLabel>
                      <Link
                        href="/auth/password-reset/request"
                        className="text-xs font-medium hover:underline"
                        tabIndex={1}
                        prefetch={false}
                      >
                        {dictionary.auth.signIn.passwordResetRequestLink}
                      </Link>
                    </div>
                    <Input
                      type="password"
                      disabled={mutation.isPending || mutation.isSuccess}
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
              {dictionary.auth.signIn.button}
            </Button>
          </div>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {dictionary.auth.signIn.socialHeader}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          asChild
          variant="outline"
          type="button"
          disabled={mutation.isPending || mutation.isSuccess}
        >
          <a href={authGoogleOauthLink()}>
            <FaGoogle className="mr-2 h-4 w-4" />
            {dictionary.auth.signIn.google}
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          type="button"
          disabled={mutation.isPending || mutation.isSuccess}
        >
          <a href={authFacebookOauthLink()}>
            <FaFacebook className="mr-2 h-4 w-4" />
            {dictionary.auth.signIn.facebook}
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          type="button"
          disabled={mutation.isPending || mutation.isSuccess}
        >
          <a href={authGithubOauthLink()}>
            <FaGithub className="mr-2 h-4 w-4" />
            {dictionary.auth.signIn.github}
          </a>
        </Button>
      </div>

      <Toaster />
    </div>
  );
}

export function SignInFormWithRecaptcha(props: SignInFormProps) {
  if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    return <SignInForm {...props} />;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
    >
      <SignInForm {...props} />
    </GoogleReCaptchaProvider>
  );
}
