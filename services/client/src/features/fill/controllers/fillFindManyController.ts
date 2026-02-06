import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { fillFindManyInputSchema } from 'src/features/fill/fillSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const fillFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/fill',
  request: {
    query: fillFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ fills: Fill[], count: number }',
    },
  },
};

export async function fillFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.fillRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    fillFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.FillWhereInput> = [];

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

  let fills = await prisma.fill.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.fill.count({
    where: {
      AND: whereAnd,
    },
  });

  fills = await filePopulateDownloadUrlInTree(fills);

  return { fills, count };
}
