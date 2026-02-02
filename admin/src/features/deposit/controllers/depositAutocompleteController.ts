import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  depositAutocompleteInputSchema,
  depositAutocompleteOutputSchema,
} from 'src/features/deposit/depositSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const depositAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/deposit/autocomplete',
  request: {
    query: depositAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(depositAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function depositAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.depositAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    depositAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.DepositWhereInput> = [];

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

  let deposits = await prisma.deposit.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return deposits.map((deposit) => {
    return {
      id: deposit.id,
    };
  });
}
