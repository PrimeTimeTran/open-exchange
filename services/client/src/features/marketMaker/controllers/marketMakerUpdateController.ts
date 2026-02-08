import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  marketMakerUpdateBodyInputSchema,
  marketMakerUpdateParamsInputSchema,
} from 'src/features/marketMaker/marketMakerSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const marketMakerUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/market-maker/{id}',
  request: {
    params: marketMakerUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: marketMakerUpdateBodyInputSchema,
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

export async function marketMakerUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.marketMakerUpdate,
    context,
  );

  const { id } = marketMakerUpdateParamsInputSchema.parse(params);

  const data = marketMakerUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.marketMaker.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
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
    },
  });

  let marketMaker = await prisma.marketMaker.findUniqueOrThrow({
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

  marketMaker = await filePopulateDownloadUrlInTree(marketMaker);

  return marketMaker;
}
