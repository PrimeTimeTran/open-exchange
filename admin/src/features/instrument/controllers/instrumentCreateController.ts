import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { instrumentCreateInputSchema } from 'src/features/instrument/instrumentSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

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



  let instrument = await prisma.instrument.create({
    data: {
      type: data.type,
      meta: data.meta,
      status: data.status,
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
