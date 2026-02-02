import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { tradeCreateInputSchema } from 'src/features/trade/tradeSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const tradeCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/trade',
  request: {
    body: {
      content: {
        'application/json': {
          schema: tradeCreateInputSchema,
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

export async function tradeCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.tradeCreate, context);
  return await tradeCreate(body, context);
}

export async function tradeCreate(body: unknown, context: AppContext) {
  const data = tradeCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let trade = await prisma.trade.create({
    data: {
      price: data.price,
      quantity: data.quantity,
      meta: data.meta,
      buyOrderId: prismaRelationship.connectMany(data.buyOrderId),
      sellOrderId: prismaRelationship.connectMany(data.sellOrderId),
      instrument: prismaRelationship.connectOne(data.instrument),
      importHash: data.importHash,
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
