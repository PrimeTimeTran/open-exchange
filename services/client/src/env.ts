import dictionary from 'src/translation/en/en';
import { z } from 'zod';
import { TypeOf } from 'zod';

export const zodEnv = z
  .object({
    // URLs
    NEXT_PUBLIC_BACKEND_URL: z.string().optional(),
    FRONTEND_URL: z.string(),

    // Locale
    NEXT_PUBLIC_LOCALE: z.enum(['en', 'es', 'de', 'pt-BR']).optional(),

    // Database
    // Database URL used on the APP. Must NOT be the database admin,
    // otherwise permission validations won't work
    DATABASE_URL: z.string(),
    // Database URL with ADMIN permissions to be able to create the app user.
    DATABASE_MIGRATION_URL: z.string(),
    DATABASE_NAME: z.string(),
    DATABASE_APP_USER: z.string(),
    DATABASE_APP_PASSWORD: z.string(),
    DATABASE_SCHEMA: z.string(),

    // Tenant Mode
    NEXT_PUBLIC_TENANT_MODE: z.enum(['single', 'multi']),

    // Auth
    // This is a random string used to sign the JWT token
    AUTH_TOKEN_SECRET: z.string(),
    // This is the amount of time the JWT token will be valid for. Ex.: 7 days
    AUTH_TOKEN_EXPIRES_IN: z.string(),
    NEXT_PUBLIC_AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
    NEXT_PUBLIC_AUTH_FACEBOOK_ID: z.string().optional(),
    AUTH_FACEBOOK_SECRET: z.string().optional(),
    NEXT_PUBLIC_AUTH_GITHUB_ID: z.string().optional(),
    AUTH_GITHUB_SECRET: z.string().optional(),
    AUTH_BYPASS_EMAIL_VERIFICATION: z.coerce.boolean().optional(),

    // Recaptcha
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
    RECAPTCHA_SECRET_KEY: z.string().optional(),

    // Storage
    FILE_STORAGE_PROVIDER: z.enum(['local', 'gcp', 'aws']),
    FILE_STORAGE_BUCKET: z.string().optional(),
    FILE_STORAGE_LOCAL_FOLDER: z.string().optional(), // Default to os.tmpdir()
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),
    GOOGLE_CLOUD_PLATFORM_CREDENTIALS: z.string().optional(),

    // Subscription
    NEXT_PUBLIC_SUBSCRIPTION_MODE: z.enum([
      'user',
      'tenant',
      'membership',
      'disabled',
    ]),
    NEXT_PUBLIC_SUBSCRIPTION_PRICES_BASIC: z.string().optional(),
    NEXT_PUBLIC_SUBSCRIPTION_PRICES_ENTERPRISE: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // Email
    EMAIL_FROM: z.string().optional(), // Leave blank to not send emails
    EMAIL_SMTP_HOST: z.string().optional(),
    EMAIL_SMTP_PORT: z.string().optional(),
    EMAIL_SMTP_USER: z.string().optional(),
    EMAIL_SMTP_PASSWORD: z.string().optional(),
  })
  .refine((data) => {
    if (data.NEXT_PUBLIC_SUBSCRIPTION_MODE !== 'disabled') {
      return (
        data.STRIPE_SECRET_KEY &&
        data.STRIPE_WEBHOOK_SECRET &&
        data.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
        data.NEXT_PUBLIC_SUBSCRIPTION_PRICES_BASIC &&
        data.NEXT_PUBLIC_SUBSCRIPTION_PRICES_ENTERPRISE
      );
    }

    return true;
  }, dictionary.subscription.errors.stripeNotConfigured)
  .refine((data) => {
    if (data.EMAIL_FROM) {
      return (
        data.EMAIL_SMTP_HOST &&
        data.EMAIL_SMTP_PORT &&
        data.EMAIL_SMTP_USER &&
        data.EMAIL_SMTP_PASSWORD
      );
    }

    return true;
  }, dictionary.emails.errors.emailNotConfigured);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends TypeOf<typeof zodEnv> {}
  }
}

try {
  zodEnv.parse(process.env);
} catch (err) {
  if (err instanceof z.ZodError) {
    if (err?.errors?.[0]?.code === 'custom') {
      throw new Error(
        `Missing environment variables: ${err?.errors?.[0]?.message}`,
      );
    }

    const { fieldErrors } = err.flatten();

    const errorMessage = Object.entries(fieldErrors)
      .map(([field, errors]) =>
        errors ? `${field}: ${errors.join(', ')}` : field,
      )
      .join('\n  ');
    throw new Error(`Missing environment variables:\n  ${errorMessage}`);
  }
}

// Credits https://www.jacobparis.com/content/type-safe-env
