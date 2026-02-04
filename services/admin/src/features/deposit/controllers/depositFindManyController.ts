import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { depositFindManyInputSchema } from 'src/features/deposit/depositSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const depositFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/deposit',
  request: {
    query: depositFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ deposits: Deposit[], count: number }',
    },
  },
};

export async function depositFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.depositRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    depositFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.DepositWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.amountRange?.length) {
    const start = filter.amountRange?.[0];
    const end = filter.amountRange?.[1];

    if (start != null) {
      whereAnd.push({
        amount: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        amount: { lte: end },
      });
    }
  }

  if (filter?.status != null) {
    whereAnd.push({
      status: filter?.status,
    });
  }

  if (filter?.chain != null) {
    whereAnd.push({
      chain: { contains: filter?.chain, mode: 'insensitive' },
    });
  }

  if (filter?.txHash != null) {
    whereAnd.push({
      txHash: { contains: filter?.txHash, mode: 'insensitive' },
    });
  }

  if (filter?.fromAddress != null) {
    whereAnd.push({
      fromAddress: { contains: filter?.fromAddress, mode: 'insensitive' },
    });
  }

  if (filter?.confirmationsRange?.length) {
    const start = filter.confirmationsRange?.[0];
    const end = filter.confirmationsRange?.[1];

    if (start != null) {
      whereAnd.push({
        confirmations: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        confirmations: { lte: end },
      });
    }
  }

  if (filter?.requiredConfirmationsRange?.length) {
    const start = filter.requiredConfirmationsRange?.[0];
    const end = filter.requiredConfirmationsRange?.[1];

    if (start != null) {
      whereAnd.push({
        requiredConfirmations: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        requiredConfirmations: { lte: end },
      });
    }
  }

  if (filter?.detectedAtRange?.length) {
    const start = filter.detectedAtRange?.[0];
    const end = filter.detectedAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        detectedAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        detectedAt: {
          lte: end,
        },
      });
    }
  }

  if (filter?.confirmedAtRange?.length) {
    const start = filter.confirmedAtRange?.[0];
    const end = filter.confirmedAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        confirmedAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        confirmedAt: {
          lte: end,
        },
      });
    }
  }

  if (filter?.creditedAtRange?.length) {
    const start = filter.creditedAtRange?.[0];
    const end = filter.creditedAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        creditedAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        creditedAt: {
          lte: end,
        },
      });
    }
  }

  const prisma = prismaAuth(context);

  let deposits = await prisma.deposit.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.deposit.count({
    where: {
      AND: whereAnd,
    },
  });

  deposits = await filePopulateDownloadUrlInTree(deposits);

  return { deposits, count };
}
