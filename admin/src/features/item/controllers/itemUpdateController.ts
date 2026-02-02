import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  itemUpdateBodyInputSchema,
  itemUpdateParamsInputSchema,
} from 'src/features/item/itemSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const itemUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/item/{id}',
  request: {
    params: itemUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: itemUpdateBodyInputSchema,
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

export async function itemUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.itemUpdate,
    context,
  );

  const { id } = itemUpdateParamsInputSchema.parse(params);

  const data = itemUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.item.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      name: data.name,
      caption: data.caption,
      description: data.description,
      price: data.price,
      photos: data.photos,
      category: data.category,
      meta: data.meta,
      files: data.files,
    },
  });

  let item = await prisma.item.findUniqueOrThrow({
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

  item = await filePopulateDownloadUrlInTree(item);

  return item;
}
