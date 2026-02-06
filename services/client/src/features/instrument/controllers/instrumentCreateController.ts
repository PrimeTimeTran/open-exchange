import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { instrumentCreateInputSchema } from 'src/features/instrument/instrumentSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const instrumentCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/instrument',
  request: {
    body: {
      content: {
        'application/json': {
          schema: instrumentCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Instrument',
    },
  },
};

export async function instrumentCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.instrumentCreate, context);
  return await instrumentCreate(body, context);
}

export async function instrumentCreate(body: unknown, context: AppContext) {
  const data = instrumentCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);

  const duplicatedSymbol = await prisma.instrument.count({
    where: { symbol: data.symbol },
  });

  if (duplicatedSymbol) {
    throw new Error400(
      formatTranslation(
        context.dictionary.shared.errors.unique,
        context.dictionary.instrument.fields.symbol,
      ),
    );
  }

  let instrument = await prisma.instrument.create({
    data: {
      symbol: data.symbol,
      type: data.type,
      status: data.status,
      meta: data.meta,
      underlyingAsset: prismaRelationship.connectOne(data.underlyingAsset),
      quoteAsset: prismaRelationship.connectOne(data.quoteAsset),
      importHash: data.importHash,
    },
    include: {
      underlyingAsset: true,
      quoteAsset: true,
      orders: true,
      trades: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  instrument = await filePopulateDownloadUrlInTree(instrument);

  return instrument;
}
