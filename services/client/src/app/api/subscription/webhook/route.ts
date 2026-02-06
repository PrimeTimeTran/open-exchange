import { NextRequest } from 'next/server';
import { subscriptionWebhookController } from 'src/features/subscription/controllers/subscriptionWebhookController';
import { NextResponseError } from 'src/shared/controller/NextResponseError';
import { NextResponseSuccess } from 'src/shared/controller/NextResponseSuccess';
import { appContext } from 'src/shared/controller/appContext';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  let context;
  try {
    context = await appContext(request);
    await subscriptionWebhookController(
      await request.text(),
      request.headers.get('stripe-signature') as string,
      context,
    );
    const payload = { received: true };
    return NextResponseSuccess(request, context, payload);
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
