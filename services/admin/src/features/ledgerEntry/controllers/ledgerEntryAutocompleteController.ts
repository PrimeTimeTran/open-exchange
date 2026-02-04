import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  ledgerEntryAutocompleteInputSchema,
  ledgerEntryAutocompleteOutputSchema,
} from 'src/features/ledgerEntry/ledgerEntrySchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const ledgerEntryAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/ledger-entry/autocomplete',
  request: {
    query: ledgerEntryAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(ledgerEntryAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function ledgerEntryAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.ledgerEntryAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    ledgerEntryAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.LedgerEntryWhereInput> = [];

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

  let ledgerEntries = await prisma.ledgerEntry.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return ledgerEntries.map((ledgerEntry) => {
    return {
      id: ledgerEntry.id,
    };
  });
}
