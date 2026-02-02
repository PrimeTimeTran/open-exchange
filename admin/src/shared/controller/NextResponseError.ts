import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { apiKeyAuditLog } from 'src/features/apiKey/apiKeyAuditLog';
import { prismaErrorParser } from 'src/prisma/prismaErrorParser';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';
import dictionary from 'src/translation/en/en';
import { Dictionary } from 'src/translation/locales';
import { ZodError } from 'zod';
import { cookieRemoveAll } from 'src/shared/lib/cookie';

export async function NextResponseError(
  req: NextRequest,
  context: AppContext | undefined,
  error: Error & { code?: number },
) {
  if (error instanceof ZodError) {
    Logger.debug(error);
    if (context) {
      await apiKeyAuditLog(req, context, '400');
    }
    return NextResponse.json(error, { status: 400 });
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    Logger.debug(error);
    if (context) {
      await apiKeyAuditLog(req, context, '400');
    }
    return NextResponse.json(
      { errors: [prismaErrorParser(error)] },
      { status: 400 },
    );
  } else if (error?.code && [400, 401, 403, 404].includes(error.code)) {
    Logger.debug(error);
    if (context) {
      await apiKeyAuditLog(req, context, String(error.code));
    }
    const response = NextResponse.json(
      wrapErrorMessage(context?.dictionary, error.message),
      { status: error.code },
    );

    if ([401, 403].includes(error.code)) {
      cookieRemoveAll(response.cookies);
    }

    return response;
  } else {
    Logger.error(error);
    if (context) {
      await apiKeyAuditLog(req, context, '500');
    }
    const isProduction = process.env.NODE_ENV === 'production';
    // If production, return a generic error message
    return NextResponse.json(
      wrapErrorMessage(
        context?.dictionary,
        isProduction ? undefined : error.message,
      ),
      {
        status: 500,
      },
    );
  }
}

function wrapErrorMessage(t?: Dictionary, message?: string) {
  return {
    errors: [
      {
        message:
          message ||
          t?.shared.errors.unknown ||
          dictionary.shared.errors.unknown,
      },
    ],
  };
}
