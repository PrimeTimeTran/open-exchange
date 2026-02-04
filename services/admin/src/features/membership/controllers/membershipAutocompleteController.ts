import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  membershipAutocompleteInputSchema,
  membershipAutocompleteOutputSchema,
} from 'src/features/membership/membershipSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const membershipAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/membership/autocomplete',
  request: {
    query: membershipAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: membershipAutocompleteOutputSchema,
        },
      },
    },
  },
};

export async function membershipAutocompleteController(
  query: unknown,
  context: AppContext,
): Promise<z.infer<typeof membershipAutocompleteOutputSchema>> {
  const { currentTenant } = validateHasPermission(
    permissions.membershipAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    membershipAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.MembershipWhereInput> = [];

  whereAnd.push({ tenantId: currentTenant.id });

  if (exclude) {
    whereAnd.push({
      id: {
        notIn: exclude,
      },
    });
  }

  if (search) {
    whereAnd.push({
      OR: [
        {
          fullName: { contains: search, mode: 'insensitive' },
        },
        {
          user: { email: { contains: search, mode: 'insensitive' } },
        },
      ],
    });
  }

  let memberships = await prisma.membership.findMany({
    where: {
      AND: whereAnd,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    take,
    orderBy,
  });

  return memberships.map((membership) => {
    return {
      id: membership.id,
      fullName: membership.fullName,
      user: {
        id: membership.user?.id,
        email: membership.user?.email,
      },
    };
  });
}
