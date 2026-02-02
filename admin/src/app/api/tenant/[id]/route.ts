import { NextRequest } from 'next/server';
import { tenantDestroyController } from 'src/features/tenant/controllers/tenantDestroyController';
import { tenantFindController } from 'src/features/tenant/controllers/tenantFindController';
import { tenantUpdateController } from 'src/features/tenant/controllers/tenantUpdateController';
import { NextResponseError } from 'src/shared/controller/NextResponseError';
import { NextResponseSuccess } from 'src/shared/controller/NextResponseSuccess';
import { appContext } from 'src/shared/controller/appContext';
import { cookieSet } from 'src/shared/lib/cookie';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  let context;
  try {
    context = await appContext(request);
    const payload = await tenantFindController(params, context);
    return NextResponseSuccess(request, context, payload);
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  let context;
  try {
    context = await appContext(request);
    const body = await request.json();
    const payload = await tenantUpdateController(params, body, context);
    return NextResponseSuccess(request, context, payload);
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  let context;
  try {
    context = await appContext(request);
    await tenantDestroyController(params, context);
    const payload = true;
    const response = await NextResponseSuccess(request, context, payload);
    await cookieSet(request.cookies, response.cookies, { tenant: '' });
    return response;
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
