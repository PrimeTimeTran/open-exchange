import { NextRequest } from 'next/server';
import { authVerifyEmailConfirmController } from 'src/features/auth/controllers/authVerifyEmailConfirmController';
import { NextResponseError } from 'src/shared/controller/NextResponseError';
import { NextResponseSuccess } from 'src/shared/controller/NextResponseSuccess';
import { appContext } from 'src/shared/controller/appContext';
import { cookieSet } from 'src/shared/lib/cookie';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  let context;
  try {
    const body = await request.json();
    context = await appContext(request);
    const payload = await authVerifyEmailConfirmController(body, context);
    const response = await NextResponseSuccess(request, context, true);
    cookieSet(request.cookies, response.cookies, {
      token: payload.token,
    });
    return response;
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
