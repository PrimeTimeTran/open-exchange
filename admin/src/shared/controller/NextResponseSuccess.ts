import { NextRequest, NextResponse } from 'next/server';
import { apiKeyAuditLog } from 'src/features/apiKey/apiKeyAuditLog';
import { AppContext } from 'src/shared/controller/appContext';

export async function NextResponseSuccess(
  req: NextRequest,
  context: AppContext,
  payload?: any,
) {
  await apiKeyAuditLog(req, context, '200');

  if (payload === undefined) {
    payload = 'OK';
  }

  return NextResponse.json(payload);
}
