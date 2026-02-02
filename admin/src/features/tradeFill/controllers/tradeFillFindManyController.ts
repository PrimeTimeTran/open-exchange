import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { tradeFillFindManyInputSchema } from 'src/features/tradeFill/tradeFillSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const tradeFillFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/trade-fill',
  request: {
    query: tradeFillFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ tradeFills: TradeFill[], count: number }',
    },
  },
};

export async function tradeFillFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.tradeFillRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    tradeFillFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.TradeFillWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.side != null) {
    whereAnd.push({
      side: filter?.side,
    });
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

  const prisma = prismaAuth(context);

  let tradeFills = await prisma.tradeFill.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.tradeFill.count({
    where: {
      AND: whereAnd,
    },
  });

  tradeFills = await filePopulateDownloadUrlInTree(tradeFills);

  return { tradeFills, count };
}
