import { NextRequest } from 'next/server';
import { auditLogOperations } from 'src/features/auditLog/auditLogOperations';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export async function apiKeyAuditLog(
  req: NextRequest,
  context: AppContext,
  apiHttpResponseCode: string,
) {
  if (!context.apiKey?.id) {
    return;
  }

  const methodOperations = {
    POST: auditLogOperations.apiPost,
    PUT: auditLogOperations.apiPut,
    DELETE: auditLogOperations.apiDelete,
    GET: auditLogOperations.apiGet,
  };

  const operation =
    methodOperations[req.method as keyof typeof methodOperations];

  if (!operation) {
    // Happens for Options requests, which are not logged
    return;
  }

  const prisma = prismaAuth(context);
  await prisma.auditLog.create({
    data: {
      entityId: context.apiKey.id,
      userId: context.currentUser?.id,
      tenantId: context.currentTenant?.id,
      membershipId: context.currentMembership?.id,
      apiKeyId: context.apiKey.id,
      entityName: 'ApiKey',
      operation,
      timestamp: new Date(),
      apiHttpResponseCode,
      apiEndpoint: req.nextUrl.pathname,
    },
  });
}
