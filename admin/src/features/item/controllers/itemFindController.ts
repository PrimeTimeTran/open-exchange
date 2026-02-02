import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { itemFindSchema } from 'src/features/item/itemSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const itemFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/item/{id}',
  request: {
    params: itemFindSchema,
  },
  responses: {
    200: {
      description: 'Item',
    },
  },
};

export async function itemFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.itemRead,
    context,
  );

  const { id } = itemFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let item = await prisma.item.findUnique({
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
