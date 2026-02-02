import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { balanceSnapshotFindManyInputSchema } from 'src/features/balanceSnapshot/balanceSnapshotSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const balanceSnapshotFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/balance-snapshot',
  request: {
    query: balanceSnapshotFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ balanceSnapshots: BalanceSnapshot[], count: number }',
    },
  },
};

export async function balanceSnapshotFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.balanceSnapshotRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    balanceSnapshotFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.BalanceSnapshotWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.availableRange?.length) {
    const start = filter.availableRange?.[0];
    const end = filter.availableRange?.[1];

    if (start != null) {
      whereAnd.push({
        available: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        available: { lte: end },
      });
    }
  }

  if (filter?.lockedRange?.length) {
    const start = filter.lockedRange?.[0];
    const end = filter.lockedRange?.[1];

    if (start != null) {
      whereAnd.push({
        locked: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        locked: { lte: end },
      });
    }
  }

  if (filter?.totalRange?.length) {
    const start = filter.totalRange?.[0];
    const end = filter.totalRange?.[1];

    if (start != null) {
      whereAnd.push({
        total: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        total: { lte: end },
      });
    }
  }

  if (filter?.snapshotAtRange?.length) {
    const start = filter.snapshotAtRange?.[0];
    const end = filter.snapshotAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        snapshotAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        snapshotAt: {
          lte: end,
        },
      });
    }
  }

  const prisma = prismaAuth(context);

  let balanceSnapshots = await prisma.balanceSnapshot.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.balanceSnapshot.count({
    where: {
      AND: whereAnd,
    },
  });

  balanceSnapshots = await filePopulateDownloadUrlInTree(balanceSnapshots);

  return { balanceSnapshots, count };
}
