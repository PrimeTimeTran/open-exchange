import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { instrumentFindManyInputSchema } from 'src/features/instrument/instrumentSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const instrumentFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/instrument',
  request: {
    query: instrumentFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ instruments: Instrument[], count: number }',
    },
  },
};

export async function instrumentFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.instrumentRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    instrumentFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.InstrumentWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.symbol != null) {
    whereAnd.push({
      symbol: { contains: filter?.symbol, mode: 'insensitive' },
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

  const prisma = prismaAuth(context);

  let instruments = await prisma.instrument.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.instrument.count({
    where: {
      AND: whereAnd,
    },
  });

  instruments = await filePopulateDownloadUrlInTree(instruments);

  return { instruments, count };
}
