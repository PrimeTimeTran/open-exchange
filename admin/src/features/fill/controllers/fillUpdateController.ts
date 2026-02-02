import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  fillUpdateBodyInputSchema,
  fillUpdateParamsInputSchema,
} from 'src/features/fill/fillSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const fillUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/fill/{id}',
  request: {
    params: fillUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: fillUpdateBodyInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Fill',
    },
  },
};

export async function fillUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.fillUpdate,
    context,
  );

  const { id } = fillUpdateParamsInputSchema.parse(params);

  const data = fillUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.fill.update({
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
      meta: data.meta,
      trade: prismaRelationship.connectOrDisconnectOne(data.trade),
    },
  });

  let fill = await prisma.fill.findUniqueOrThrow({
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

  fill = await filePopulateDownloadUrlInTree(fill);

  return fill;
}
