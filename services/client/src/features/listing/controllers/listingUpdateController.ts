import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  listingUpdateBodyInputSchema,
  listingUpdateParamsInputSchema,
} from 'src/features/listing/listingSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const listingUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/listing/{id}',
  request: {
    params: listingUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: listingUpdateBodyInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Listing',
    },
  },
};

export async function listingUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.listingUpdate,
    context,
  );

  const { id } = listingUpdateParamsInputSchema.parse(params);

  const data = listingUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.listing.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      companyName: data.companyName,
      legalName: data.legalName,
      jurisdiction: data.jurisdiction,
      incorporationDate: data.incorporationDate,
      website: data.website,
      assetSymbol: data.assetSymbol,
      assetClass: data.assetClass,
      status: data.status,
      submittedAt: data.submittedAt,
      decisionAt: data.decisionAt,
      kycCompleted: data.kycCompleted,
      docsSubmitted: data.docsSubmitted,
      riskDisclosureUrl: data.riskDisclosureUrl,
      primaryContactName: data.primaryContactName,
      primaryContactEmail: data.primaryContactEmail,
      reviewedBy: data.reviewedBy,
      notes: data.notes,
      meta: data.meta,
    },
  });

  let listing = await prisma.listing.findUniqueOrThrow({
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
