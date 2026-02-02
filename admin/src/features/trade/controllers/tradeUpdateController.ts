import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  tradeUpdateBodyInputSchema,
  tradeUpdateParamsInputSchema,
} from 'src/features/trade/tradeSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const tradeUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/trade/{id}',
  request: {
    params: tradeUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: tradeUpdateBodyInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Trade',
    },
  },
};

export async function tradeUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.tradeUpdate,
    context,
  );

  const { id } = tradeUpdateParamsInputSchema.parse(params);

  const data = tradeUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.trade.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      price: data.price,
      quantity: data.quantity,
      meta: data.meta,
      buyOrderId: prismaRelationship.setMany(data.buyOrderId),
      sellOrderId: prismaRelationship.setMany(data.sellOrderId),
      instrument: prismaRelationship.connectOrDisconnectOne(data.instrument),
    },
  });

  let trade = await prisma.trade.findUniqueOrThrow({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      buyOrderId: true,
      sellOrderId: true,
      instrument: true,
      fills: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  trade = await filePopulateDownloadUrlInTree(trade);

  return trade;
}
