import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { toLower } from 'lodash';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const authOauthSchema = z.object({
  oauthProvider: z.enum(['google', 'facebook', 'github']),
  code: z.string().trim().openapi({ type: 'string' }),
  invitationToken: z.string().optional(),
});

export const authPasswordChangeInputSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8).max(255),
});

export const authPasswordResetConfirmInputSchema = z.object({
  token: z.string().trim().min(1),
  password: z.string().min(8).max(255),
  recaptchaToken: process.env.RECAPTCHA_SECRET_KEY
    ? z.string()
    : z.string().optional(),
});

export const authPasswordResetRequestInputSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1)
    .email()
    .transform(toLower)
    .openapi({ type: 'string', format: 'email' }),
  recaptchaToken: process.env.RECAPTCHA_SECRET_KEY
    ? z.string()
    : z.string().optional(),
});

export const authSignInInputSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .email()
    .transform(toLower)
    .openapi({ type: 'string', format: 'email' }),
  password: z.string().min(1).min(8),
  invitationToken: z.string().optional(),
  recaptchaToken: process.env.RECAPTCHA_SECRET_KEY
    ? z.string()
    : z.string().optional(),
});

export const authSignUpInputSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .email()
    .transform(toLower)
    .openapi({ type: 'string', format: 'email' }),
  password: z.string().min(8).max(255),
  invitationToken: z.string().optional(),
  recaptchaToken: process.env.RECAPTCHA_SECRET_KEY
    ? z.string()
    : z.string().optional(),
});

export const authVerifyEmailRequestInputSchema = z.object({
  recaptchaToken: process.env.RECAPTCHA_SECRET_KEY
    ? z.string()
    : z.string().optional(),
});

export const authVerifyEmailConfirmInputSchema = z.object({
  token: z.string().trim().min(1),
  recaptchaToken: process.env.RECAPTCHA_SECRET_KEY
    ? z.string()
    : z.string().optional(),
});
