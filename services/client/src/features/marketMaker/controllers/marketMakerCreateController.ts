import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { marketMakerCreateInputSchema } from 'src/features/marketMaker/marketMakerSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const marketMakerCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/market-maker',
  request: {
    body: {
      content: {
        'application/json': {
          schema: marketMakerCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'MarketMaker',
    },
  },
};

export async function marketMakerCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.marketMakerCreate, context);
  return await marketMakerCreate(body, context);
}

export async function marketMakerCreate(body: unknown, context: AppContext) {
  const data = marketMakerCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let marketMaker = await prisma.marketMaker.create({
    data: {
      organizationName: data.organizationName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      status: data.status,
      tier: data.tier,
      marketsSupported: data.marketsSupported,
      minQuoteSize: data.minQuoteSize,
      maxQuoteSize: data.maxQuoteSize,
      spreadLimit: data.spreadLimit,
      quoteObligation: data.quoteObligation,
      dailyVolumeTarget: data.dailyVolumeTarget,
      makerFee: data.makerFee,
      takerFee: data.takerFee,
      rebateRate: data.rebateRate,
      rebateBalance: data.rebateBalance,
      apiAccess: data.apiAccess,
      maxOrdersPerSecond: data.maxOrdersPerSecond,
      directMarketAccess: data.directMarketAccess,
      contractSignedAt: data.contractSignedAt,
      obligationViolationCount: data.obligationViolationCount,
      auditLog: data.auditLog,
      notesInternal: data.notesInternal,
      specialOrderTypes: data.specialOrderTypes,
      minFeeAmount: data.minFeeAmount,
      importHash: data.importHash,
    },
    include: {

      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  marketMaker = await filePopulateDownloadUrlInTree(marketMaker);

  return marketMaker;
}
