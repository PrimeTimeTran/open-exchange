import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  tradeAutocompleteInputSchema,
  tradeAutocompleteOutputSchema,
} from 'src/features/trade/tradeSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const tradeAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/trade/autocomplete',
  request: {
    query: tradeAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(tradeAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function tradeAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.tradeAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    tradeAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.TradeWhereInput> = [];

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

  let trades = await prisma.trade.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return trades.map((trade) => {
    return {
      id: trade.id,
    };
  });
}
