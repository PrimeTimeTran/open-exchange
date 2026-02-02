import { NextRequest } from 'next/server';
import { queryToObject } from 'src/shared/lib/queryToObject';
import { membershipAcceptInvitationController } from 'src/features/membership/controllers/membershipAcceptInvitationController';
import { membershipDeclineInvitationController } from 'src/features/membership/controllers/membershipDeclineInvitationController';
import { NextResponseError } from 'src/shared/controller/NextResponseError';
import { NextResponseSuccess } from 'src/shared/controller/NextResponseSuccess';
import { appContext } from 'src/shared/controller/appContext';
import { cookieSet } from 'src/shared/lib/cookie';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  let context;
  try {
    context = await appContext(request);
    const body = await request.json();
    const { tenantId } = await membershipAcceptInvitationController(
      body,
      context,
    );

    const payload = true;
    const response = await NextResponseSuccess(request, context, payload);

    cookieSet(request.cookies, response.cookies, {
      tenant: tenantId,
    });
    return response;
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}

export async function DELETE(request: NextRequest) {
  let context;
  try {
    context = await appContext(request);
    const query = queryToObject(request.nextUrl.search);
    await membershipDeclineInvitationController(query, context);
    const payload = true;
    return NextResponseSuccess(request, context, payload);
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
