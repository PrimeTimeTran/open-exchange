import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  itemAutocompleteInputSchema,
  itemAutocompleteOutputSchema,
} from 'src/features/item/itemSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const itemAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/item/autocomplete',
  request: {
    query: itemAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(itemAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function itemAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.itemAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    itemAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.ItemWhereInput> = [];

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

  let items = await prisma.item.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return items.map((item) => {
    return {
      id: item.id,
    };
  });
}
