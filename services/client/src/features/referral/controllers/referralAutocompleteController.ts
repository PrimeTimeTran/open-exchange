import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  referralAutocompleteInputSchema,
  referralAutocompleteOutputSchema,
} from 'src/features/referral/referralSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const referralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/referral/autocomplete',
  request: {
    query: referralAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(referralAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function referralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.referralAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    referralAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.ReferralWhereInput> = [];

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

  let referrals = await prisma.referral.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return referrals.map((referral) => {
    return {
      id: referral.id,
    };
  });
}
