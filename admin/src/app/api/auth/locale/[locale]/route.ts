import { NextRequest } from 'next/server';
import { NextResponseError } from 'src/shared/controller/NextResponseError';
import { NextResponseSuccess } from 'src/shared/controller/NextResponseSuccess';
import { appContext } from 'src/shared/controller/appContext';
import { cookieSet } from 'src/shared/lib/cookie';
import { Locale, defaultLocale, locales } from 'src/translation/locales';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  { params }: { params: { locale: Locale } },
) {
  let context;
  try {
    context = await appContext(request);
    const response = await NextResponseSuccess(request, context, true);

    let locale = params.locale;

    if (!locales.includes(locale)) {
      locale = defaultLocale;
    }

    cookieSet(request.cookies, response.cookies, {
      locale,
    });
    return response;
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
