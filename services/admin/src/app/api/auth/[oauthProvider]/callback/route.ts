import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { authOauthController } from 'src/features/auth/controllers/authOauthController';
import { appContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';
import { cookieGet, cookieSet } from 'src/shared/lib/cookie';
import { queryToObject } from 'src/shared/lib/queryToObject';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { oauthProvider: string } },
) {
  let context;
  try {
    context = await appContext(request);
    const query = queryToObject(request.nextUrl.search);
    query.oauthProvider = params.oauthProvider;
    query.invitationToken =
      query.invitationToken ||
      cookieGet(request.cookies, 'invitationToken') ||
      '';
    const payload = await authOauthController(query, context);
    const response = NextResponse.redirect(process.env.FRONTEND_URL);
    cookieSet(request.cookies, response.cookies, {
      invitationToken: '',
      token: payload.token,
    });
    return response;
  } catch (error: any) {
    Logger.error(error);
    redirect(`${process.env.FRONTEND_URL}/auth/sign-in?oauthError=true`);
  }
}
