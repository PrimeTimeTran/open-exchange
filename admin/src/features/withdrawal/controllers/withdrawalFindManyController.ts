import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { withdrawalFindManyInputSchema } from 'src/features/withdrawal/withdrawalSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const withdrawalFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/withdrawal',
  request: {
    query: withdrawalFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ withdrawals: Withdrawal[], count: number }',
    },
  },
};

export async function withdrawalFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.withdrawalRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    withdrawalFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.WithdrawalWhereInput> = [];

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

  if (filter?.feeRange?.length) {
    const start = filter.feeRange?.[0];
    const end = filter.feeRange?.[1];

    if (start != null) {
      whereAnd.push({
        fee: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        fee: { lte: end },
      });
    }
  }

  if (filter?.status != null) {
    whereAnd.push({
      status: filter?.status,
    });
  }

  if (filter?.destinationAddress != null) {
    whereAnd.push({
      destinationAddress: { contains: filter?.destinationAddress, mode: 'insensitive' },
    });
  }

  if (filter?.destinationTag != null) {
    whereAnd.push({
      destinationTag: { contains: filter?.destinationTag, mode: 'insensitive' },
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

  if (filter?.failureReason != null) {
    whereAnd.push({
      failureReason: { contains: filter?.failureReason, mode: 'insensitive' },
    });
  }

  if (filter?.requestedBy != null) {
    whereAnd.push({
      requestedBy: { contains: filter?.requestedBy, mode: 'insensitive' },
    });
  }

  if (filter?.approvedBy != null) {
    whereAnd.push({
      approvedBy: { contains: filter?.approvedBy, mode: 'insensitive' },
    });
  }

  if (filter?.approvedAtRange?.length) {
    const start = filter.approvedAtRange?.[0];
    const end = filter.approvedAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        approvedAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        approvedAt: {
          lte: end,
        },
      });
    }
  }

  if (filter?.requestedAtRange?.length) {
    const start = filter.requestedAtRange?.[0];
    const end = filter.requestedAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        requestedAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        requestedAt: {
          lte: end,
        },
      });
    }
  }

  if (filter?.broadcastAtRange?.length) {
    const start = filter.broadcastAtRange?.[0];
    const end = filter.broadcastAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        broadcastAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        broadcastAt: {
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

  const prisma = prismaAuth(context);

  let withdrawals = await prisma.withdrawal.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.withdrawal.count({
    where: {
      AND: whereAnd,
    },
  });

  withdrawals = await filePopulateDownloadUrlInTree(withdrawals);

  return { withdrawals, count };
}
