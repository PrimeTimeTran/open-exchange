import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  orderAutocompleteInputSchema,
  orderAutocompleteOutputSchema,
} from 'src/features/order/orderSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const orderAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/order/autocomplete',
  request: {
    query: orderAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(orderAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function orderAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.orderAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    orderAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.OrderWhereInput> = [];

  whereAnd.push({ tenantId: currentTenant.id });

  whereAnd.push({ archivedAt: null });

  if (exclude) {
    whereAnd.push({
      id: {
        notIn: exclude,
      },
    });
  }

  if (search) {
    whereAnd.push({
      id: search,
    });
  }

  let orders = await prisma.order.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return orders.map((order) => {
    return {
      id: order.id,
    };
  });
}
