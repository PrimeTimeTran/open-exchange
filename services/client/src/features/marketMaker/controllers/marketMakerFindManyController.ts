import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { marketMakerFindManyInputSchema } from 'src/features/marketMaker/marketMakerSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const marketMakerFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/market-maker',
  request: {
    query: marketMakerFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ marketMakers: MarketMaker[], count: number }',
    },
  },
};

export async function marketMakerFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.marketMakerRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    marketMakerFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.MarketMakerWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.organizationName != null) {
    whereAnd.push({
      organizationName: { contains: filter?.organizationName, mode: 'insensitive' },
    });
  }

  if (filter?.contactEmail != null) {
    whereAnd.push({
      contactEmail: { contains: filter?.contactEmail, mode: 'insensitive' },
    });
  }

  if (filter?.contactPhone != null) {
    whereAnd.push({
      contactPhone: { contains: filter?.contactPhone, mode: 'insensitive' },
    });
  }

  if (filter?.status != null) {
    whereAnd.push({
      status: filter?.status,
    });
  }

  if (filter?.tier != null) {
    whereAnd.push({
      tier: filter?.tier,
    });
  }

  if (filter?.marketsSupported != null) {
    whereAnd.push({
      marketsSupported: { contains: filter?.marketsSupported, mode: 'insensitive' },
    });
  }

  if (filter?.minQuoteSizeRange?.length) {
    const start = filter.minQuoteSizeRange?.[0];
    const end = filter.minQuoteSizeRange?.[1];

    if (start != null) {
      whereAnd.push({
        minQuoteSize: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        minQuoteSize: { lte: end },
      });
    }
  }

  if (filter?.maxQuoteSizeRange?.length) {
    const start = filter.maxQuoteSizeRange?.[0];
    const end = filter.maxQuoteSizeRange?.[1];

    if (start != null) {
      whereAnd.push({
        maxQuoteSize: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        maxQuoteSize: { lte: end },
      });
    }
  }

  if (filter?.spreadLimitRange?.length) {
    const start = filter.spreadLimitRange?.[0];
    const end = filter.spreadLimitRange?.[1];

    if (start != null) {
      whereAnd.push({
        spreadLimit: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        spreadLimit: { lte: end },
      });
    }
  }

  if (filter?.quoteObligation != null) {
    whereAnd.push({
      quoteObligation: filter.quoteObligation,
    });
  }

  if (filter?.dailyVolumeTargetRange?.length) {
    const start = filter.dailyVolumeTargetRange?.[0];
    const end = filter.dailyVolumeTargetRange?.[1];

    if (start != null) {
      whereAnd.push({
        dailyVolumeTarget: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        dailyVolumeTarget: { lte: end },
      });
    }
  }

  if (filter?.makerFeeRange?.length) {
    const start = filter.makerFeeRange?.[0];
    const end = filter.makerFeeRange?.[1];

    if (start != null) {
      whereAnd.push({
        makerFee: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        makerFee: { lte: end },
      });
    }
  }

  if (filter?.takerFeeRange?.length) {
    const start = filter.takerFeeRange?.[0];
    const end = filter.takerFeeRange?.[1];

    if (start != null) {
      whereAnd.push({
        takerFee: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        takerFee: { lte: end },
      });
    }
  }

  if (filter?.rebateRateRange?.length) {
    const start = filter.rebateRateRange?.[0];
    const end = filter.rebateRateRange?.[1];

    if (start != null) {
      whereAnd.push({
        rebateRate: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        rebateRate: { lte: end },
      });
    }
  }

  if (filter?.rebateBalanceRange?.length) {
    const start = filter.rebateBalanceRange?.[0];
    const end = filter.rebateBalanceRange?.[1];

    if (start != null) {
      whereAnd.push({
        rebateBalance: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        rebateBalance: { lte: end },
      });
    }
  }

  if (filter?.apiAccess != null) {
    whereAnd.push({
      apiAccess: filter.apiAccess,
    });
  }

  if (filter?.maxOrdersPerSecondRange?.length) {
    const start = filter.maxOrdersPerSecondRange?.[0];
    const end = filter.maxOrdersPerSecondRange?.[1];

    if (start != null) {
      whereAnd.push({
        maxOrdersPerSecond: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        maxOrdersPerSecond: { lte: end },
      });
    }
  }

  if (filter?.directMarketAccess != null) {
    whereAnd.push({
      directMarketAccess: filter.directMarketAccess,
    });
  }

  if (filter?.contractSignedAtRange?.length) {
    const start = filter.contractSignedAtRange?.[0];
    const end = filter.contractSignedAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        contractSignedAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        contractSignedAt: {
          lte: end,
        },
      });
    }
  }

  if (filter?.obligationViolationCountRange?.length) {
    const start = filter.obligationViolationCountRange?.[0];
    const end = filter.obligationViolationCountRange?.[1];

    if (start != null) {
      whereAnd.push({
        obligationViolationCount: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        obligationViolationCount: { lte: end },
      });
    }
  }

  if (filter?.notesInternal != null) {
    whereAnd.push({
      notesInternal: { contains: filter?.notesInternal, mode: 'insensitive' },
    });
  }

  if (filter?.specialOrderTypes != null) {
    whereAnd.push({
      specialOrderTypes: filter?.specialOrderTypes,
    });
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

  const prisma = prismaAuth(context);

  let marketMakers = await prisma.marketMaker.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.marketMaker.count({
    where: {
      AND: whereAnd,
    },
  });

  marketMakers = await filePopulateDownloadUrlInTree(marketMakers);

  return { marketMakers, count };
}
