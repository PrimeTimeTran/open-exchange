import { ApiKey, Membership, Subscription, Tenant } from '@prisma/client';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import {
  authMiddleware,
  authenticateWithJwtToken,
} from 'src/features/auth/authMiddleware';
import { UserWithMemberships } from 'src/features/user/userSchemas';
import Error401 from 'src/shared/errors/Error401';
import { dictionaryMiddleware } from 'src/translation/dictionaryMiddleware';
import { getLocaleFromCookies } from 'src/translation/getLocaleFromCookies';
import { Dictionary, Locale, defaultLocale } from 'src/translation/locales';
import { cookieGet } from 'src/shared/lib/cookie';

export interface AppContext {
  locale: Locale;
  dictionary: Dictionary;
  currentUser?: UserWithMemberships | null;
  currentMembership?: Membership | null;
  currentTenant?: Tenant | null;
  currentSubscription?: Subscription | null;
  apiKey?: ApiKey | null;
}

export interface AppContextAuthenticated extends AppContext {
  currentUser: UserWithMemberships;
  currentMembership: Membership;
  currentTenant: Tenant;
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function appContext(req: NextRequest) {
  const locale = cookieGet(req.cookies, 'locale') ?? defaultLocale;
  let context = await dictionaryMiddleware(locale, {});
  context = await authMiddleware(req, context);
  return context;
}

export async function appContextForReact(cookies: ReadonlyRequestCookies) {
  const locale = getLocaleFromCookies(cookies);
  const token = cookieGet(cookies, 'token');
  const tenantId = cookieGet(cookies, 'tenant');
  let context = await dictionaryMiddleware(locale, {});
  if (token) {
    try {
      context = await authenticateWithJwtToken(token, tenantId, context);
    } catch (error: unknown) {
      if (error instanceof Error401) {
        redirect(`/auth/sign-out`);
      } else {
        throw error;
      }
    }
  }
  return context;
}
