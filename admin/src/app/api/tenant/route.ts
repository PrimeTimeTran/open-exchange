import { NextRequest } from 'next/server';
import { queryToObject } from 'src/shared/lib/queryToObject';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { tenantFindManyController } from 'src/features/tenant/controllers/tenantFindManyController';
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
    const payload = await tenantCreateController(body, context);
    const response = await NextResponseSuccess(request, context, payload);
    cookieSet(request.cookies, response.cookies, { tenant: payload.id });
    return response;
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}

export async function GET(request: NextRequest) {
  let context;
  try {
    context = await appContext(request);
    const query = queryToObject(request.nextUrl.search);
    const payload = await tenantFindManyController(query, context);
    return NextResponseSuccess(request, context, payload);
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
