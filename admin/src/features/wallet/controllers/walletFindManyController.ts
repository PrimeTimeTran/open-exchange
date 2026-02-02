import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { walletFindManyInputSchema } from 'src/features/wallet/walletSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const walletFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/wallet',
  request: {
    query: walletFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ wallets: Wallet[], count: number }',
    },
  },
};

export async function walletFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.walletRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    walletFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.WalletWhereInput> = [];

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

  if (filter?.versionRange?.length) {
    const start = filter.versionRange?.[0];
    const end = filter.versionRange?.[1];

    if (start != null) {
      whereAnd.push({
        version: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        version: { lte: end },
      });
    }
  }

  const prisma = prismaAuth(context);

  let wallets = await prisma.wallet.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.wallet.count({
    where: {
      AND: whereAnd,
    },
  });

  wallets = await filePopulateDownloadUrlInTree(wallets);

  return { wallets, count };
}
