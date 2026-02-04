import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  balanceSnapshotAutocompleteInputSchema,
  balanceSnapshotAutocompleteOutputSchema,
} from 'src/features/balanceSnapshot/balanceSnapshotSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const balanceSnapshotAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/balance-snapshot/autocomplete',
  request: {
    query: balanceSnapshotAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(balanceSnapshotAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function balanceSnapshotAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.balanceSnapshotAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    balanceSnapshotAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.BalanceSnapshotWhereInput> = [];

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

  let balanceSnapshots = await prisma.balanceSnapshot.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return balanceSnapshots.map((balanceSnapshot) => {
    return {
      id: balanceSnapshot.id,
    };
  });
}
