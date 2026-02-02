import { NextRequest } from 'next/server';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { NextResponseError } from 'src/shared/controller/NextResponseError';
import { NextResponseSuccess } from 'src/shared/controller/NextResponseSuccess';
import { appContext } from 'src/shared/controller/appContext';
import { cookieGet, cookieSet } from 'src/shared/lib/cookie';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  let context;
  try {
    const body: any = await request.json();
    body.invitationToken =
      body.invitationToken ||
      cookieGet(request.cookies, 'invitationToken') ||
      '';

    context = await appContext(request);
    const payload = await authSignUpController(body, context);
    const response = await NextResponseSuccess(request, context, true);
    cookieSet(request.cookies, response.cookies, {
      invitationToken: '',
      token: payload.token,
    });
    return response;
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
