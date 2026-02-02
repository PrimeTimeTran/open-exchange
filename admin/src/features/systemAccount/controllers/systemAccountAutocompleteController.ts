import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  systemAccountAutocompleteInputSchema,
  systemAccountAutocompleteOutputSchema,
} from 'src/features/systemAccount/systemAccountSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const systemAccountAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/system-account/autocomplete',
  request: {
    query: systemAccountAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(systemAccountAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function systemAccountAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.systemAccountAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    systemAccountAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.SystemAccountWhereInput> = [];

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

  let systemAccounts = await prisma.systemAccount.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return systemAccounts.map((systemAccount) => {
    return {
      id: systemAccount.id,
    };
  });
}
