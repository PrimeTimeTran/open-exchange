import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  accountAutocompleteInputSchema,
  accountAutocompleteOutputSchema,
} from 'src/features/account/accountSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const accountAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/account/autocomplete',
  request: {
    query: accountAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(accountAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function accountAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.accountAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    accountAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.AccountWhereInput> = [];

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

  let accounts = await prisma.account.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return accounts.map((account) => {
    return {
      id: account.id,
    };
  });
}
