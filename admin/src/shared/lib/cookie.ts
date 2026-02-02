import dayjs from 'dayjs';
import ms from 'ms';
import {
  RequestCookies,
  ResponseCookies,
} from 'next/dist/compiled/@edge-runtime/cookies';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

const COOKIE_NAME = '__session';

export function cookieRemoveAll(cookies: ResponseCookies) {
  cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
  });
}

export function cookieSet(
  requestCookies: RequestCookies | ReadonlyRequestCookies,
  responseCookies: ResponseCookies,
  values: Record<string, string>,
) {
  let __session: Record<string, string>;

  try {
    __session = JSON.parse(
      requestCookies.get(COOKIE_NAME)?.value || '{}',
    ) as Record<string, string>;
  } catch {
    __session = {};
  }

  for (let key of Object.keys(values)) {
    __session[key] = values[key];
  }

  responseCookies.set(COOKIE_NAME, JSON.stringify(__session), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: dayjs()
      .add(ms(process.env.AUTH_TOKEN_EXPIRES_IN), 'milliseconds')
      .toDate(),
  });
}

export function cookieGet(
  cookies: RequestCookies | ReadonlyRequestCookies,
  key: string,
) {
  let __session: Record<string, string>;

  try {
    __session = JSON.parse(cookies.get(COOKIE_NAME)?.value || '{}') as Record<
      string,
      string
    >;
  } catch {
    __session = {};
  }

  return __session[key];
}
