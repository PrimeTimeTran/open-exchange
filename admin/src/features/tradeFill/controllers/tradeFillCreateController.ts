import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { tradeFillCreateInputSchema } from 'src/features/tradeFill/tradeFillSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const tradeFillCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/trade-fill',
  request: {
    body: {
      content: {
        'application/json': {
          schema: tradeFillCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'TradeFill',
    },
  },
};

export async function tradeFillCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.tradeFillCreate, context);
  return await tradeFillCreate(body, context);
}

export async function tradeFillCreate(body: unknown, context: AppContext) {
  const data = tradeFillCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let tradeFill = await prisma.tradeFill.create({
    data: {
      side: data.side,
      price: data.price,
      quantity: data.quantity,
      fee: data.fee,
      trade: prismaRelationship.connectOne(data.trade),
      importHash: data.importHash,
    },
    include: {
      trade: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  tradeFill = await filePopulateDownloadUrlInTree(tradeFill);

  return tradeFill;
}
