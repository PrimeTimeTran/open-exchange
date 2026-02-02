import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { fillFindSchema } from 'src/features/fill/fillSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const fillFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/fill/{id}',
  request: {
    params: fillFindSchema,
  },
  responses: {
    200: {
      description: 'Fill',
    },
  },
};

export async function fillFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.fillRead,
    context,
  );

  const { id } = fillFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let fill = await prisma.fill.findUnique({
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
