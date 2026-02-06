import { NextRequest } from 'next/server';
import { apiKeyDestroyController } from 'src/features/apiKey/controllers/apiKeyDestroyController';
import { apiKeyUpdateController } from 'src/features/apiKey/controllers/apiKeyUpdateController';
import { NextResponseError } from 'src/shared/controller/NextResponseError';
import { NextResponseSuccess } from 'src/shared/controller/NextResponseSuccess';
import { appContext } from 'src/shared/controller/appContext';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  let context;
  try {
    context = await appContext(request);
    const body = await request.json();
    const payload = await apiKeyUpdateController(params, body, context);
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
    await apiKeyDestroyController(params, context);
    const payload = true;
    return NextResponseSuccess(request, context, payload);
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
