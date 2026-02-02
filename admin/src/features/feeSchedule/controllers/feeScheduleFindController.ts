import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { feeScheduleFindSchema } from 'src/features/feeSchedule/feeScheduleSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const feeScheduleFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/fee-schedule/{id}',
  request: {
    params: feeScheduleFindSchema,
  },
  responses: {
    200: {
      description: 'FeeSchedule',
    },
  },
};

export async function feeScheduleFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.feeScheduleRead,
    context,
  );

  const { id } = feeScheduleFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let feeSchedule = await prisma.feeSchedule.findUnique({
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

  feeSchedule = await filePopulateDownloadUrlInTree(feeSchedule);

  return feeSchedule;
}
