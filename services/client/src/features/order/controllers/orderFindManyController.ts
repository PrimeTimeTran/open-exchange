import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { orderFindManyInputSchema } from 'src/features/order/orderSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const orderFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/order',
  request: {
    query: orderFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ orders: Order[], count: number }',
    },
  },
};

export async function orderFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.orderRead,
    context,
  );

  const { filter, orderBy, skip, take } = orderFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.OrderWhereInput> = [];

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

  if (filter?.createdByUserId != null) {
    whereAnd.push({
      createdByUserId: filter?.createdByUserId,
    });
  }

  if (filter?.type != null) {
    whereAnd.push({
      type: filter?.type,
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

  if (filter?.quantityFilledRange?.length) {
    const start = filter.quantityFilledRange?.[0];
    const end = filter.quantityFilledRange?.[1];

    if (start != null) {
      whereAnd.push({
        quantityFilled: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        quantityFilled: { lte: end },
      });
    }
  }

  if (filter?.status != null) {
    whereAnd.push({
      status: filter?.status,
    });
  }

  if (filter?.timeInFore != null) {
    whereAnd.push({
      timeInFore: filter?.timeInFore,
    });
  }

  const prisma = prismaAuth(context);

  let orders = await prisma.order.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.order.count({
    where: {
      AND: whereAnd,
    },
  });

  orders = await filePopulateDownloadUrlInTree(orders);

  return { orders, count };
}
