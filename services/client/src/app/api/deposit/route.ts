import { NextRequest } from 'next/server';
import { queryToObject } from 'src/shared/lib/queryToObject';
import { depositCreateController } from 'src/features/deposit/controllers/depositCreateController';
import { depositDestroyManyController } from 'src/features/deposit/controllers/depositDestroyManyController';
import { depositFindManyController } from 'src/features/deposit/controllers/depositFindManyController';
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
    const payload = await depositCreateController(body, context);
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
    const payload = await depositFindManyController(query, context);
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
    await depositDestroyManyController(query, context);
    const payload = true;
    return NextResponseSuccess(request, context, payload);
  } catch (error: any) {
    return NextResponseError(request, context, error);
  }
}
