import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  assetAutocompleteInputSchema,
  assetAutocompleteOutputSchema,
} from 'src/features/asset/assetSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const assetAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/asset/autocomplete',
  request: {
    query: assetAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(assetAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function assetAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.assetAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    assetAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.AssetWhereInput> = [];

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
      symbol: {
        contains: search,
        mode: 'insensitive',
      },
    });
  }

  let assets = await prisma.asset.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return assets.map((asset) => {
    return {
      id: asset.id,
    symbol: String(asset.symbol),
    };
  });
}
