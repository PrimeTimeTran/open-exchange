import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  marketMakerAutocompleteInputSchema,
  marketMakerAutocompleteOutputSchema,
} from 'src/features/marketMaker/marketMakerSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const marketMakerAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/market-maker/autocomplete',
  request: {
    query: marketMakerAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(marketMakerAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function marketMakerAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.marketMakerAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    marketMakerAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.MarketMakerWhereInput> = [];

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
      organizationName: {
        contains: search,
        mode: 'insensitive',
      },
    });
  }

  let marketMakers = await prisma.marketMaker.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return marketMakers.map((marketMaker) => {
    return {
      id: marketMaker.id,
    organizationName: String(marketMaker.organizationName),
    };
  });
}
