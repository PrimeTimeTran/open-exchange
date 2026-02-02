import { NextRequest } from 'next/server';
import { authPasswordChangeController } from 'src/features/auth/controllers/authPasswordChangeController';
import { NextResponseError } from 'src/shared/controller/NextResponseError';
import { NextResponseSuccess } from 'src/shared/controller/NextResponseSuccess';
import { appContext } from 'src/shared/controller/appContext';
import { cookieRemoveAll } from 'src/shared/lib/cookie';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request: NextRequest) {
  let context;
  try {
    const body = await request.json();
    context = await appContext(request);
    const payload = await authPasswordChangeController(body, context);
    const response = await NextResponseSuccess(request, context, payload);
    cookieRemoveAll(response.cookies);
    return response;
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
