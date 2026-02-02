import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  withdrawalAutocompleteInputSchema,
  withdrawalAutocompleteOutputSchema,
} from 'src/features/withdrawal/withdrawalSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const withdrawalAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/withdrawal/autocomplete',
  request: {
    query: withdrawalAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(withdrawalAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function withdrawalAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.withdrawalAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    withdrawalAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.WithdrawalWhereInput> = [];

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

  let withdrawals = await prisma.withdrawal.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return withdrawals.map((withdrawal) => {
    return {
      id: withdrawal.id,
    };
  });
}
