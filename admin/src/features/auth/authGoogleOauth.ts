import { toLower } from 'lodash';
import { Logger } from 'src/shared/lib/Logger';
import { z } from 'zod';

export const authGoogleOauthRedirectUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/auth/google/callback`;

export function authGoogleOauthLink() {
  const params = new URLSearchParams({
    client_id: String(process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID),
    redirect_uri: authGoogleOauthRedirectUrl,
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function authGoogleValidateCode(code: string) {
  const responseToken = await fetch('https://oauth2.googleapis.com/token', {
    method: 'post',
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID,
      client_secret: process.env.AUTH_GOOGLE_SECRET,
      redirect_uri: authGoogleOauthRedirectUrl,
      grant_type: 'authorization_code',
      code,
    }),
    cache: 'no-store',
  });

  if (!responseToken.ok) {
    const errorPayload = await responseToken.json();
    Logger.error(errorPayload);
    throw new Error();
  }

  const responseTokenValidator = z.object({
    access_token: z.string(),
    expires_in: z.number(),
    token_type: z.string(),
    refresh_token: z.string(),
  });

  const { access_token } = responseTokenValidator.parse(
    await responseToken.json(),
  );

  const responseUserInfo = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      cache: 'no-store',
    },
  );

  if (!responseUserInfo.ok) {
    const errorPayload = await responseUserInfo.json();
    Logger.error(errorPayload);
    throw new Error();
  }

  const responseUserInfoValidator = z.object({
    id: z.string(),
    email: z.string().trim().email().transform(toLower),
    given_name: z.string().optional(),
    family_name: z.string().optional(),
  });

  const { email, given_name, family_name } = responseUserInfoValidator.parse(
    await responseUserInfo.json(),
  );

  return { email, firstName: given_name, lastName: family_name };
}
