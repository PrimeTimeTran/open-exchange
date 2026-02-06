import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  listingAutocompleteInputSchema,
  listingAutocompleteOutputSchema,
} from 'src/features/listing/listingSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const listingAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/listing/autocomplete',
  request: {
    query: listingAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(listingAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function listingAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.listingAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    listingAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.ListingWhereInput> = [];

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
      assetSymbol: {
        contains: search,
        mode: 'insensitive',
      },
    });
  }

  let listings = await prisma.listing.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return listings.map((listing) => {
    return {
      id: listing.id,
    assetSymbol: String(listing.assetSymbol),
    };
  });
}
