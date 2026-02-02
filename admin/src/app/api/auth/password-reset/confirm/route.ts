import { NextRequest } from 'next/server';
import { authPasswordResetConfirmController } from 'src/features/auth/controllers/authPasswordResetConfirmController';
import { NextResponseError } from 'src/shared/controller/NextResponseError';
import { NextResponseSuccess } from 'src/shared/controller/NextResponseSuccess';
import { appContext } from 'src/shared/controller/appContext';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  let context;
  try {
    const body = await request.json();
    context = await appContext(request);
    const payload = await authPasswordResetConfirmController(body, context);
    return NextResponseSuccess(request, context, payload);
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
