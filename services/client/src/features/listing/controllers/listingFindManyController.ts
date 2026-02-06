import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { listingFindManyInputSchema } from 'src/features/listing/listingSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const listingFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/listing',
  request: {
    query: listingFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ listings: Listing[], count: number }',
    },
  },
};

export async function listingFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.listingRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    listingFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.ListingWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.companyName != null) {
    whereAnd.push({
      companyName: { contains: filter?.companyName, mode: 'insensitive' },
    });
  }

  if (filter?.legalName != null) {
    whereAnd.push({
      legalName: { contains: filter?.legalName, mode: 'insensitive' },
    });
  }

  if (filter?.jurisdiction != null) {
    whereAnd.push({
      jurisdiction: { contains: filter?.jurisdiction, mode: 'insensitive' },
    });
  }

  if (filter?.incorporationDateRange?.length) {
    const start = filter.incorporationDateRange?.[0];
    const end = filter.incorporationDateRange?.[1];

    if (start != null) {
      whereAnd.push({
        incorporationDate: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        incorporationDate: {
          lte: end,
        },
      });
    }
  }

  if (filter?.website != null) {
    whereAnd.push({
      website: { contains: filter?.website, mode: 'insensitive' },
    });
  }

  if (filter?.assetSymbol != null) {
    whereAnd.push({
      assetSymbol: { contains: filter?.assetSymbol, mode: 'insensitive' },
    });
  }

  if (filter?.assetClass != null) {
    whereAnd.push({
      assetClass: filter?.assetClass,
    });
  }

  if (filter?.status != null) {
    whereAnd.push({
      status: filter?.status,
    });
  }

  if (filter?.submittedAtRange?.length) {
    const start = filter.submittedAtRange?.[0];
    const end = filter.submittedAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        submittedAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        submittedAt: {
          lte: end,
        },
      });
    }
  }

  if (filter?.decisionAtRange?.length) {
    const start = filter.decisionAtRange?.[0];
    const end = filter.decisionAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        decisionAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        decisionAt: {
          lte: end,
        },
      });
    }
  }

  if (filter?.kycCompleted != null) {
    whereAnd.push({
      kycCompleted: filter.kycCompleted,
    });
  }

  if (filter?.docsSubmitted != null) {
    whereAnd.push({
      docsSubmitted: filter.docsSubmitted,
    });
  }

  if (filter?.riskDisclosureUrl != null) {
    whereAnd.push({
      riskDisclosureUrl: { contains: filter?.riskDisclosureUrl, mode: 'insensitive' },
    });
  }

  if (filter?.primaryContactName != null) {
    whereAnd.push({
      primaryContactName: { contains: filter?.primaryContactName, mode: 'insensitive' },
    });
  }

  if (filter?.primaryContactEmail != null) {
    whereAnd.push({
      primaryContactEmail: { contains: filter?.primaryContactEmail, mode: 'insensitive' },
    });
  }

  if (filter?.reviewedBy != null) {
    whereAnd.push({
      reviewedBy: { contains: filter?.reviewedBy, mode: 'insensitive' },
    });
  }

  if (filter?.notes != null) {
    whereAnd.push({
      notes: { contains: filter?.notes, mode: 'insensitive' },
    });
  }

  const prisma = prismaAuth(context);

  let listings = await prisma.listing.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.listing.count({
    where: {
      AND: whereAnd,
    },
  });

  listings = await filePopulateDownloadUrlInTree(listings);

  return { listings, count };
}
