import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  instrumentUpdateBodyInputSchema,
  instrumentUpdateParamsInputSchema,
} from 'src/features/instrument/instrumentSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const instrumentUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/instrument/{id}',
  request: {
    params: instrumentUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: instrumentUpdateBodyInputSchema,
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

export async function instrumentUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.instrumentUpdate,
    context,
  );

  const { id } = instrumentUpdateParamsInputSchema.parse(params);

  const data = instrumentUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.instrument.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      type: data.type,
      meta: data.meta,
      status: data.status,
      underlyingAsset: prismaRelationship.connectOrDisconnectOne(data.underlyingAsset),
      quoteAsset: prismaRelationship.connectOrDisconnectOne(data.quoteAsset),
    },
  });

  let instrument = await prisma.instrument.findUniqueOrThrow({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
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
