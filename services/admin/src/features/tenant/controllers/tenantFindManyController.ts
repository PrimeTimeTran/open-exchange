import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import { validateIsSignedInAndEmailVerified } from 'src/features/security';
import { tenantFindManyInputSchema } from 'src/features/tenant/tenantSchemas';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const tenantFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/tenant',
  request: {
    query: tenantFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ tenants: Tenant[], count: number }',
    },
  },
};

export async function tenantFindManyController(
  body: unknown,
  context: AppContext,
) {
  validateIsSignedInAndEmailVerified(context);

  const { filter, orderBy, skip, take } = tenantFindManyInputSchema.parse(body);

  const whereAnd: Array<Prisma.TenantWhereInput> = [];

  whereAnd.push({
    memberships: {
      some: {
        userId: context.currentUser?.id,
        roles: { isEmpty: false },
      },
    },
  });

  if (filter?.name) {
    whereAnd.push({ name: { contains: filter?.name, mode: 'insensitive' } });
  }

  if (filter?.createdAtRange?.length) {
    const start = filter.createdAtRange?.[0];
    const end = filter.createdAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        createdAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        createdAt: {
          lte: end,
        },
      });
    }
  }

  const prisma = prismaDangerouslyBypassAuth(context);

  const tenants = await prisma.tenant.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.tenant.count({
    where: {
      AND: whereAnd,
    },
  });

  return { tenants, count };
}
