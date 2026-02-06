import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { MembershipStatus } from 'src/features/membership/MembershipStatus';
import { membershipFindManyInputSchema } from 'src/features/membership/membershipSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const membershipFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/membership',
  request: {
    query: membershipFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ memberships: Membership[], count: number }',
    },
  },
};

export async function membershipFindManyController(
  query: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.membershipRead, context);

  let { filter, orderBy, skip, take } =
    membershipFindManyInputSchema.parse(query);

  if (orderBy?.['user_email']) {
    orderBy = {
      user: {
        email: orderBy['user_email'] === 'asc' ? 'asc' : 'desc',
      },
    };
  }

  const whereAnd: Array<Prisma.MembershipWhereInput> = [];

  whereAnd.push({
    tenantId: context.currentTenant?.id,
  });

  if (filter?.email) {
    whereAnd.push({
      user: { email: { contains: filter?.email, mode: 'insensitive' } },
    });
  }

  if (filter?.fullName) {
    whereAnd.push({
      fullName: { contains: filter?.fullName, mode: 'insensitive' },
    });
  }

  if (filter?.firstName) {
    whereAnd.push({
      firstName: { contains: filter?.firstName, mode: 'insensitive' },
    });
  }

  if (filter?.lastName) {
    whereAnd.push({
      lastName: { contains: filter?.lastName, mode: 'insensitive' },
    });
  }

  if (filter?.roles?.length) {
    whereAnd.push({
      roles: { hasSome: filter?.roles },
    });
  }

  if (filter?.statuses?.length) {
    const whereOr = [];
    for (let status of filter.statuses) {
      if (status === MembershipStatus.invited) {
        whereOr.push({
          invitationToken: { not: null },
          roles: { isEmpty: false },
        });
      } else if (status === MembershipStatus.disabled) {
        whereOr.push({
          roles: { isEmpty: true },
        });
      } else if (status === MembershipStatus.active) {
        whereOr.push({
          invitationToken: null,
          roles: { isEmpty: false },
        });
      }
    }
    whereAnd.push({ OR: whereOr });
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

  const prisma = prismaAuth(context);

  let memberships = await prisma.membership.findMany({
    where: {
      AND: whereAnd,
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.membership.count({
    where: {
      AND: whereAnd,
    },
  });

  memberships = memberships.map((membership) => {
    membership.invitationToken = null;
    return membership;
  });

  memberships = await filePopulateDownloadUrlInTree(memberships);

  return { memberships, count };
}
