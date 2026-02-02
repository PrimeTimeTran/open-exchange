import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { itemFindManyInputSchema } from 'src/features/item/itemSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const itemFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/item',
  request: {
    query: itemFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ items: Item[], count: number }',
    },
  },
};

export async function itemFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.itemRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    itemFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.ItemWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.name != null) {
    whereAnd.push({
      name: { contains: filter?.name, mode: 'insensitive' },
    });
  }

  if (filter?.caption != null) {
    whereAnd.push({
      caption: { contains: filter?.caption, mode: 'insensitive' },
    });
  }

  if (filter?.description != null) {
    whereAnd.push({
      description: { contains: filter?.description, mode: 'insensitive' },
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



  const prisma = prismaAuth(context);

  let items = await prisma.item.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.item.count({
    where: {
      AND: whereAnd,
    },
  });

  items = await filePopulateDownloadUrlInTree(items);

  return { items, count };
}
