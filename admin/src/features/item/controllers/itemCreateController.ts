import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { itemCreateInputSchema } from 'src/features/item/itemSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const itemCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/item',
  request: {
    body: {
      content: {
        'application/json': {
          schema: itemCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Item',
    },
  },
};

export async function itemCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.itemCreate, context);
  return await itemCreate(body, context);
}

export async function itemCreate(body: unknown, context: AppContext) {
  const data = itemCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let item = await prisma.item.create({
    data: {
      name: data.name,
      caption: data.caption,
      description: data.description,
      price: data.price,
      photos: data.photos,
      category: data.category,
      meta: data.meta,
      files: data.files,
      importHash: data.importHash,
    },
    include: {

      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  item = await filePopulateDownloadUrlInTree(item);

  return item;
}
