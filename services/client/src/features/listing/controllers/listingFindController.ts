import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { listingFindSchema } from 'src/features/listing/listingSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const listingFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/listing/{id}',
  request: {
    params: listingFindSchema,
  },
  responses: {
    200: {
      description: 'Listing',
    },
  },
};

export async function listingFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.listingRead,
    context,
  );

  const { id } = listingFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let listing = await prisma.listing.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {

      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  listing = await filePopulateDownloadUrlInTree(listing);

  return listing;
}
