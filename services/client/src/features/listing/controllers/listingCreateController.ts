import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { listingCreateInputSchema } from 'src/features/listing/listingSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const listingCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/listing',
  request: {
    body: {
      content: {
        'application/json': {
          schema: listingCreateInputSchema,
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

export async function listingCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.listingCreate, context);
  return await listingCreate(body, context);
}

export async function listingCreate(body: unknown, context: AppContext) {
  const data = listingCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let listing = await prisma.listing.create({
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
      importHash: data.importHash,
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
