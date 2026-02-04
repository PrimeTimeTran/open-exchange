import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { instrumentFindSchema } from 'src/features/instrument/instrumentSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const instrumentFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/instrument/{id}',
  request: {
    params: instrumentFindSchema,
  },
  responses: {
    200: {
      description: 'Instrument',
    },
  },
};

export async function instrumentFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.instrumentRead,
    context,
  );

  const { id } = instrumentFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let instrument = await prisma.instrument.findUnique({
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
