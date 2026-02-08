import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { accountFindManyInputSchema } from 'src/features/account/accountSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const accountFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/account',
  request: {
    query: accountFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ accounts: Account[], count: number }',
    },
  },
};

export async function accountFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.accountRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    accountFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.AccountWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.name != null) {
    whereAnd.push({
      name: { contains: filter?.name, mode: 'insensitive' },
    });
  }

  if (filter?.isSystem != null) {
    whereAnd.push({
      isSystem: filter.isSystem,
    });
  }

  if (filter?.type != null) {
    whereAnd.push({
      type: filter?.type,
    });
  }

  if (filter?.status != null) {
    whereAnd.push({
      status: filter?.status,
    });
  }

  if (filter?.isInterest != null) {
    whereAnd.push({
      isInterest: filter.isInterest,
    });
  }

  if (filter?.interestRateRange?.length) {
    const start = filter.interestRateRange?.[0];
    const end = filter.interestRateRange?.[1];

    if (start != null) {
      whereAnd.push({
        interestRate: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        interestRate: { lte: end },
      });
    }
  }

  const prisma = prismaAuth(context);

  let accounts = await prisma.account.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.account.count({
    where: {
      AND: whereAnd,
    },
  });

  accounts = await filePopulateDownloadUrlInTree(accounts);

  return { accounts, count };
}
