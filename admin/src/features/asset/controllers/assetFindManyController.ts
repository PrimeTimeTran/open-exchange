import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { assetFindManyInputSchema } from 'src/features/asset/assetSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const assetFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/asset',
  request: {
    query: assetFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ assets: Asset[], count: number }',
    },
  },
};

export async function assetFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.assetRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    assetFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.AssetWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.symbol != null) {
    whereAnd.push({
      symbol: { contains: filter?.symbol, mode: 'insensitive' },
    });
  }

  if (filter?.type != null) {
    whereAnd.push({
      type: filter?.type,
    });
  }

  if (filter?.precisionRange?.length) {
    const start = filter.precisionRange?.[0];
    const end = filter.precisionRange?.[1];

    if (start != null) {
      whereAnd.push({
        precision: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        precision: { lte: end },
      });
    }
  }

  if (filter?.isFractional != null) {
    whereAnd.push({
      isFractional: filter.isFractional,
    });
  }

  const prisma = prismaAuth(context);

  let assets = await prisma.asset.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.asset.count({
    where: {
      AND: whereAnd,
    },
  });

  assets = await filePopulateDownloadUrlInTree(assets);

  return { assets, count };
}
