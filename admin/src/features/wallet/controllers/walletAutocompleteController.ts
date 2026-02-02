import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  walletAutocompleteInputSchema,
  walletAutocompleteOutputSchema,
} from 'src/features/wallet/walletSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const walletAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/wallet/autocomplete',
  request: {
    query: walletAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(walletAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function walletAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.walletAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    walletAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.WalletWhereInput> = [];

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

  let wallets = await prisma.wallet.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return wallets.map((wallet) => {
    return {
      id: wallet.id,
    };
  });
}
