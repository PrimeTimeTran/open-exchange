import { toLower } from 'lodash';
import { Logger } from 'src/shared/lib/Logger';
import { z } from 'zod';

export const authFacebookOauthRedirectUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/auth/facebook/callback`;

export function authFacebookOauthLink() {
  const params = new URLSearchParams({
    client_id: String(process.env.NEXT_PUBLIC_AUTH_FACEBOOK_ID),
    redirect_uri: authFacebookOauthRedirectUrl,
    scope: ['email'].join(','),
    response_type: 'code',
    auth_type: 'rerequest',
    display: 'popup',
  });

  return `https://www.facebook.com/v4.0/dialog/oauth?${params.toString()}`;
}

export async function authFacebookValidateCode(code: string) {
  const responseToken = await fetch(
    `https://graph.facebook.com/v4.0/oauth/access_token?${new URLSearchParams({
      client_id: String(process.env.NEXT_PUBLIC_AUTH_FACEBOOK_ID),
      client_secret: String(process.env.AUTH_FACEBOOK_SECRET),
      redirect_uri: authFacebookOauthRedirectUrl,
      code,
    })}`,
    {
      method: 'get',
      cache: 'no-store',
    },
  );

  if (!responseToken.ok) {
    const errorPayload = await responseToken.json();
    Logger.error(errorPayload);
    throw new Error();
  }

  const responseTokenValidator = z.object({
    access_token: z.string(),
    expires_in: z.number(),
    token_type: z.string(),
  });

  const { access_token } = responseTokenValidator.parse(
    await responseToken.json(),
  );

  const responseUserInfo = await fetch(
    `https://graph.facebook.com/me?${new URLSearchParams({
      fields: 'id,email,first_name,last_name',
      access_token,
    })}`,
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
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  });

  const { email, first_name, last_name } = responseUserInfoValidator.parse(
    await responseUserInfo.json(),
  );

  return { email, firstName: first_name, lastName: last_name };
}
