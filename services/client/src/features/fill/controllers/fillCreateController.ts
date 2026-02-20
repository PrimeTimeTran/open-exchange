import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { fillCreateInputSchema } from 'src/features/fill/fillSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const fillCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/fill',
  request: {
    body: {
      content: {
        'application/json': {
          schema: fillCreateInputSchema,
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

export async function fillCreateController(body: unknown, context: AppContext) {
  validateHasPermission(permissions.fillCreate, context);
  return await fillCreate(body, context);
}

export async function fillCreate(body: unknown, context: AppContext) {
  const data = fillCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);

  let fill = await prisma.fill.create({
    data: {
      side: data.side,
      price: data.price,
      quantity: data.quantity,
      fee: data.fee,
      meta: data.meta,
      trade: prismaRelationship.connectOne(data.trade),
      importHash: data.importHash,
    } as any,
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
