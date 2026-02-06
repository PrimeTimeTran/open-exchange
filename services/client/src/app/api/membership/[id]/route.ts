import { NextRequest } from 'next/server';
import { membershipFindController } from 'src/features/membership/controllers/membershipFindController';
import { membershipUpdateController } from 'src/features/membership/controllers/membershipUpdateController';
import { NextResponseError } from 'src/shared/controller/NextResponseError';
import { NextResponseSuccess } from 'src/shared/controller/NextResponseSuccess';
import { appContext } from 'src/shared/controller/appContext';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  let context;
  try {
    context = await appContext(request);
    const payload = await membershipFindController(params, context);
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
    const payload = await membershipUpdateController(params, body, context);
    return NextResponseSuccess(request, context, payload);
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
