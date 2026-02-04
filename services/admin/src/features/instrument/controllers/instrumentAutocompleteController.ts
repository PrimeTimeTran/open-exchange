import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  instrumentAutocompleteInputSchema,
  instrumentAutocompleteOutputSchema,
} from 'src/features/instrument/instrumentSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const instrumentAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/instrument/autocomplete',
  request: {
    query: instrumentAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(instrumentAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function instrumentAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.instrumentAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    instrumentAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.InstrumentWhereInput> = [];

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

  let instruments = await prisma.instrument.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return instruments.map((instrument) => {
    return {
      id: instrument.id,
    };
  });
}
