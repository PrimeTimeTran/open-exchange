import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  ledgerEventAutocompleteInputSchema,
  ledgerEventAutocompleteOutputSchema,
} from 'src/features/ledgerEvent/ledgerEventSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const ledgerEventAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/ledger-event/autocomplete',
  request: {
    query: ledgerEventAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(ledgerEventAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function ledgerEventAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.ledgerEventAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    ledgerEventAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.LedgerEventWhereInput> = [];

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

  let ledgerEvents = await prisma.ledgerEvent.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return ledgerEvents.map((ledgerEvent) => {
    return {
      id: ledgerEvent.id,
    };
  });
}
