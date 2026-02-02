import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { ledgerEntryFindManyInputSchema } from 'src/features/ledgerEntry/ledgerEntrySchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const ledgerEntryFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/ledger-entry',
  request: {
    query: ledgerEntryFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ ledgerEntries: LedgerEntry[], count: number }',
    },
  },
};

export async function ledgerEntryFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.ledgerEntryRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    ledgerEntryFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.LedgerEntryWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.amountRange?.length) {
    const start = filter.amountRange?.[0];
    const end = filter.amountRange?.[1];

    if (start != null) {
      whereAnd.push({
        amount: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        amount: { lte: end },
      });
    }
  }

  const prisma = prismaAuth(context);

  let ledgerEntries = await prisma.ledgerEntry.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.ledgerEntry.count({
    where: {
      AND: whereAnd,
    },
  });

  ledgerEntries = await filePopulateDownloadUrlInTree(ledgerEntries);

  return { ledgerEntries, count };
}
