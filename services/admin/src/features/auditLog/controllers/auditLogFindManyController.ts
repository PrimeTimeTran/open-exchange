import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import { uniq } from 'lodash';
import { auditLogFindManyInputSchema } from 'src/features/auditLog/auditLogSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const auditLogFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/audit-log',
  request: {
    query: auditLogFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ auditLogs: AuditLogWithAuthor[], count: number }',
    },
  },
};

export async function auditLogFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.auditLogRead,
    context,
  );

  let { filter, orderBy, skip, take } =
    auditLogFindManyInputSchema.parse(query);

  if (orderBy?.['apiKey_name']) {
    orderBy = {
      apiKey: {
        name: orderBy['apiKey_name'] === 'asc' ? 'asc' : 'desc',
      },
    };
  }

  const whereAnd: Array<Prisma.AuditLogWhereInput> = [];

  whereAnd.push({
    tenantId: currentTenant.id,
  });

  if (filter?.entityNames?.length) {
    whereAnd.push({
      OR: filter.entityNames?.map((entityName) => ({
        entityName: { equals: entityName, mode: 'insensitive' },
      })),
    });
  }

  if (filter?.membership != null) {
    whereAnd.push({
      membershipId: filter.membership,
    });
  }

  if (filter?.transactionId != null) {
    whereAnd.push({
      transactionId: Number(filter.transactionId),
    });
  }

  if (filter?.entityId != null) {
    whereAnd.push({
      entityId: filter.entityId,
    });
  }

  if (filter?.apiKey != null) {
    whereAnd.push({
      apiKeyId: filter.apiKey,
    });
  }

  if (filter?.apiHttpResponseCode != null) {
    whereAnd.push({
      apiHttpResponseCode: filter.apiHttpResponseCode,
    });
  }

  if (filter?.apiEndpoint != null) {
    whereAnd.push({
      apiEndpoint: { contains: filter?.apiEndpoint, mode: 'insensitive' },
    });
  }

  if (filter?.operations?.length) {
    whereAnd.push({
      operation: {
        in: filter.operations,
      },
    });
  }

  if (filter?.timestampRange?.length) {
    const start = filter.timestampRange?.[0];
    const end = filter.timestampRange?.[1];

    if (start != null) {
      whereAnd.push({
        timestamp: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        timestamp: {
          lte: end,
        },
      });
    }
  }

  const prisma = prismaAuth(context);

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  let authors = await prisma.membership.findMany({
    where: {
      id: {
        in: uniq(
          auditLogs.map((auditLog) => auditLog.membershipId).filter(Boolean),
        ),
      },
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  const apiKeys = await prisma.apiKey.findMany({
    where: {
      id: {
        in: uniq(
          auditLogs.map((auditLog) => auditLog.apiKeyId).filter(Boolean),
        ),
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  authors = await filePopulateDownloadUrlInTree(authors);

  const auditLogsWithAuthorAndApiKey = auditLogs.map((auditLog) => {
    const apiKey = apiKeys.find((apiKey) => apiKey.id === auditLog.apiKeyId);

    let author = authors.find((author) => author.id === auditLog.membershipId);

    return {
      ...auditLog,
      apiKey,
      authorEmail: author?.user?.email,
      authorFirstName: author?.firstName,
      authorLastName: author?.lastName,
      authorAvatars: author?.avatars,
    };
  });

  const count = await prisma.auditLog.count({
    where: {
      AND: whereAnd,
    },
  });

  return { auditLogs: auditLogsWithAuthorAndApiKey, count };
}
