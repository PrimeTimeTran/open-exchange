import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { feeScheduleFindManyInputSchema } from 'src/features/feeSchedule/feeScheduleSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const feeScheduleFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/fee-schedule',
  request: {
    query: feeScheduleFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ feeSchedules: FeeSchedule[], count: number }',
    },
  },
};

export async function feeScheduleFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.feeScheduleRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    feeScheduleFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.FeeScheduleWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.scope != null) {
    whereAnd.push({
      scope: filter?.scope,
    });
  }

  if (filter?.makerFeeBpsRange?.length) {
    const start = filter.makerFeeBpsRange?.[0];
    const end = filter.makerFeeBpsRange?.[1];

    if (start != null) {
      whereAnd.push({
        makerFeeBps: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        makerFeeBps: { lte: end },
      });
    }
  }

  if (filter?.takerFeeBpsRange?.length) {
    const start = filter.takerFeeBpsRange?.[0];
    const end = filter.takerFeeBpsRange?.[1];

    if (start != null) {
      whereAnd.push({
        takerFeeBps: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        takerFeeBps: { lte: end },
      });
    }
  }

  if (filter?.minFeeAmountRange?.length) {
    const start = filter.minFeeAmountRange?.[0];
    const end = filter.minFeeAmountRange?.[1];

    if (start != null) {
      whereAnd.push({
        minFeeAmount: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        minFeeAmount: { lte: end },
      });
    }
  }

  if (filter?.effectiveFromRange?.length) {
    const start = filter.effectiveFromRange?.[0];
    const end = filter.effectiveFromRange?.[1];

    if (start != null) {
      whereAnd.push({
        effectiveFrom: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        effectiveFrom: {
          lte: end,
        },
      });
    }
  }

  if (filter?.effectiveToRange?.length) {
    const start = filter.effectiveToRange?.[0];
    const end = filter.effectiveToRange?.[1];

    if (start != null) {
      whereAnd.push({
        effectiveTo: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        effectiveTo: {
          lte: end,
        },
      });
    }
  }

  if (filter?.tier != null) {
    whereAnd.push({
      tier: { contains: filter?.tier, mode: 'insensitive' },
    });
  }

  if (filter?.accountId != null) {
    whereAnd.push({
      accountId: { contains: filter?.accountId, mode: 'insensitive' },
    });
  }

  if (filter?.instrumentId != null) {
    whereAnd.push({
      instrumentId: { contains: filter?.instrumentId, mode: 'insensitive' },
    });
  }

  const prisma = prismaAuth(context);

  let feeSchedules = await prisma.feeSchedule.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.feeSchedule.count({
    where: {
      AND: whereAnd,
    },
  });

  feeSchedules = await filePopulateDownloadUrlInTree(feeSchedules);

  return { feeSchedules, count };
}
