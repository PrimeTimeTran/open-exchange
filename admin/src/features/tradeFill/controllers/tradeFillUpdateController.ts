import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  tradeFillUpdateBodyInputSchema,
  tradeFillUpdateParamsInputSchema,
} from 'src/features/tradeFill/tradeFillSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const tradeFillUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/trade-fill/{id}',
  request: {
    params: tradeFillUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: tradeFillUpdateBodyInputSchema,
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

export async function tradeFillUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.tradeFillUpdate,
    context,
  );

  const { id } = tradeFillUpdateParamsInputSchema.parse(params);

  const data = tradeFillUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.tradeFill.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      side: data.side,
      price: data.price,
      quantity: data.quantity,
      fee: data.fee,
      trade: prismaRelationship.connectOrDisconnectOne(data.trade),
    },
  });

  let tradeFill = await prisma.tradeFill.findUniqueOrThrow({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
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
