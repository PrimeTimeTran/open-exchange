import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { ledgerEventFindManyInputSchema } from 'src/features/ledgerEvent/ledgerEventSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const ledgerEventFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/ledger-event',
  request: {
    query: ledgerEventFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ ledgerEvents: LedgerEvent[], count: number }',
    },
  },
};

export async function ledgerEventFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.ledgerEventRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    ledgerEventFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.LedgerEventWhereInput> = [];

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

  if (filter?.referenceId != null) {
    whereAnd.push({
      referenceId: { contains: filter?.referenceId, mode: 'insensitive' },
    });
  }

  if (filter?.referenceType != null) {
    whereAnd.push({
      referenceType: filter?.referenceType,
    });
  }

  if (filter?.status != null) {
    whereAnd.push({
      status: filter?.status,
    });
  }

  if (filter?.description != null) {
    whereAnd.push({
      description: { contains: filter?.description, mode: 'insensitive' },
    });
  }

  const prisma = prismaAuth(context);

  let ledgerEvents = await prisma.ledgerEvent.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.ledgerEvent.count({
    where: {
      AND: whereAnd,
    },
  });

  ledgerEvents = await filePopulateDownloadUrlInTree(ledgerEvents);

  return { ledgerEvents, count };
}
