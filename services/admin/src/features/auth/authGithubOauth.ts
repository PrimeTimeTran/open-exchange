import { toLower } from 'lodash';
import Error400 from 'src/shared/errors/Error400';
import { Logger } from 'src/shared/lib/Logger';
import { z } from 'zod';

export const authGitHubOauthRedirectUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/auth/github/callback`;

export function authGithubOauthLink() {
  const params = new URLSearchParams({
    client_id: String(process.env.NEXT_PUBLIC_AUTH_GITHUB_ID),
    redirect_uri: authGitHubOauthRedirectUrl,
    scope: ['user:email', 'read:user'].join(' '),
    allow_signup: 'true',
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function authGithubValidateCode(code: string) {
  const responseToken = await fetch(
    `https://github.com/login/oauth/access_token?${new URLSearchParams({
      client_id: String(process.env.NEXT_PUBLIC_AUTH_GITHUB_ID),
      client_secret: String(process.env.AUTH_GITHUB_SECRET),
      redirect_uri: authGitHubOauthRedirectUrl,
      code,
    })}`,
    {
      method: 'get',
      cache: 'no-store',
    },
  );

  if (!responseToken.ok) {
    const errorPayload = await responseToken.text();
    Logger.error(errorPayload);
    throw new Error();
  }

  const responseData = Object.fromEntries(
    new URLSearchParams(await responseToken.text()),
  );

  if (responseData.error) {
    throw new Error400(responseData.error_description);
  }

  const responseTokenValidator = z.object({
    access_token: z.string(),
  });

  const { access_token } = responseTokenValidator.parse(responseData);

  const responseUserInfo = await fetch(`https://api.github.com/user`, {
    headers: {
      Authorization: `token ${access_token}`,
    },
    cache: 'no-store',
  });

  if (!responseUserInfo.ok) {
    const errorPayload = await responseUserInfo.json();
    Logger.error(errorPayload);
    throw new Error();
  }

  const responseUserInfoValidator = z.object({
    id: z.number(),
    email: z.string().trim().email().transform(toLower),
    name: z.string(),
  });

  const userInfo = await responseUserInfo.json();
  const { email, name } = responseUserInfoValidator.parse(userInfo);
  let [firstName, ...lastNameAsArray] = name?.split(' ') || [];
  const lastName = lastNameAsArray?.length ? lastNameAsArray.join(' ') : '';

  return { email, firstName, lastName };
}
