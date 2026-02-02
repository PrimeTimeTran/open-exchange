import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  tradeFillAutocompleteInputSchema,
  tradeFillAutocompleteOutputSchema,
} from 'src/features/tradeFill/tradeFillSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const tradeFillAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/trade-fill/autocomplete',
  request: {
    query: tradeFillAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(tradeFillAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function tradeFillAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.tradeFillAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    tradeFillAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.TradeFillWhereInput> = [];

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

  let tradeFills = await prisma.tradeFill.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return tradeFills.map((tradeFill) => {
    return {
      id: tradeFill.id,
    };
  });
}
