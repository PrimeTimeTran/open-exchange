import { NextRequest } from 'next/server';
import { referralArchiveManyController } from 'src/features/referral/controllers/referralArchiveManyController';
import { NextResponseError } from 'src/shared/controller/NextResponseError';
import { NextResponseSuccess } from 'src/shared/controller/NextResponseSuccess';
import { appContext } from 'src/shared/controller/appContext';
import { queryToObject } from 'src/shared/lib/queryToObject';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request: NextRequest) {
  let context;
  try {
    context = await appContext(request);
    const query = queryToObject(request.nextUrl.search);
    await referralArchiveManyController(query, context);
    const payload = true;
    return NextResponseSuccess(request, context, payload);
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
