import { NextRequest } from 'next/server';
import { queryToObject } from 'src/shared/lib/queryToObject';
import { systemAccountCreateController } from 'src/features/systemAccount/controllers/systemAccountCreateController';
import { systemAccountDestroyManyController } from 'src/features/systemAccount/controllers/systemAccountDestroyManyController';
import { systemAccountFindManyController } from 'src/features/systemAccount/controllers/systemAccountFindManyController';
import { NextResponseError } from 'src/shared/controller/NextResponseError';
import { NextResponseSuccess } from 'src/shared/controller/NextResponseSuccess';
import { appContext } from 'src/shared/controller/appContext';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  let context;
  try {
    context = await appContext(request);
    const body = await request.json();
    const payload = await systemAccountCreateController(body, context);
    return NextResponseSuccess(request, context, payload);
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}

export async function GET(request: NextRequest) {
  let context;
  try {
    context = await appContext(request);
    const query = queryToObject(request.nextUrl.search);
    const payload = await systemAccountFindManyController(query, context);
    return NextResponseSuccess(request, context, payload);
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}

export async function DELETE(request: NextRequest) {
  let context;
  try {
    context = await appContext(request);
    const query = queryToObject(request.nextUrl.search);
    await systemAccountDestroyManyController(query, context);
    const payload = true;
    return NextResponseSuccess(request, context, payload);
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
