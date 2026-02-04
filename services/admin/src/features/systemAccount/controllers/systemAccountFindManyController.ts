import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { systemAccountFindManyInputSchema } from 'src/features/systemAccount/systemAccountSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const systemAccountFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/system-account',
  request: {
    query: systemAccountFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ systemAccounts: SystemAccount[], count: number }',
    },
  },
};

export async function systemAccountFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.systemAccountRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    systemAccountFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.SystemAccountWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.type != null) {
    whereAnd.push({
      type: filter?.type,
    });
  }

  if (filter?.name != null) {
    whereAnd.push({
      name: { contains: filter?.name, mode: 'insensitive' },
    });
  }

  if (filter?.description != null) {
    whereAnd.push({
      description: { contains: filter?.description, mode: 'insensitive' },
    });
  }

  if (filter?.isActive != null) {
    whereAnd.push({
      isActive: filter.isActive,
    });
  }

  const prisma = prismaAuth(context);

  let systemAccounts = await prisma.systemAccount.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.systemAccount.count({
    where: {
      AND: whereAnd,
    },
  });

  systemAccounts = await filePopulateDownloadUrlInTree(systemAccounts);

  return { systemAccounts, count };
}
