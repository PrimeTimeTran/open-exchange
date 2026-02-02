import { NextRequest } from 'next/server';
import { NextResponseError } from 'src/shared/controller/NextResponseError';
import { NextResponseSuccess } from 'src/shared/controller/NextResponseSuccess';
import { appContext } from 'src/shared/controller/appContext';
import { cookieSet } from 'src/shared/lib/cookie';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  let context;
  try {
    context = await appContext(request);
    const response = await NextResponseSuccess(request, context, true);
    cookieSet(request.cookies, response.cookies, {
      tenant: params.id,
    });
    return response;
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
