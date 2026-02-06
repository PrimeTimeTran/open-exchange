import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { tradeFindManyInputSchema } from 'src/features/trade/tradeSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const tradeFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/trade',
  request: {
    query: tradeFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ trades: Trade[], count: number }',
    },
  },
};

export async function tradeFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.tradeRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    tradeFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.TradeWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.priceRange?.length) {
    const start = filter.priceRange?.[0];
    const end = filter.priceRange?.[1];

    if (start != null) {
      whereAnd.push({
        price: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        price: { lte: end },
      });
    }
  }

  if (filter?.quantityRange?.length) {
    const start = filter.quantityRange?.[0];
    const end = filter.quantityRange?.[1];

    if (start != null) {
      whereAnd.push({
        quantity: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        quantity: { lte: end },
      });
    }
  }

  const prisma = prismaAuth(context);

  let trades = await prisma.trade.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.trade.count({
    where: {
      AND: whereAnd,
    },
  });

  trades = await filePopulateDownloadUrlInTree(trades);

  return { trades, count };
}
