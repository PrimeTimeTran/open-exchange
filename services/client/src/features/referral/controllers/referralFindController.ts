import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { referralFindSchema } from 'src/features/referral/referralSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const referralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/referral/{id}',
  request: {
    params: referralFindSchema,
  },
  responses: {
    200: {
      description: 'Referral',
    },
  },
};

export async function referralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.referralRead,
    context,
  );

  const { id } = referralFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let referral = await prisma.referral.findUnique({
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

  referral = await filePopulateDownloadUrlInTree(referral);

  return referral;
}
