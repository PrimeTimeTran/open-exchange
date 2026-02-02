import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { feeScheduleRestoreManyInputSchema } from 'src/features/feeSchedule/feeScheduleSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const feeScheduleRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/fee-schedule/restore',
  request: {
    query: feeScheduleRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function feeScheduleRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.feeScheduleRestore,
    context,
  );

  const { ids } = feeScheduleRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.feeSchedule.updateMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
    data: {
      archivedAt: null,
      archivedByMembershipId: null,
    },
  });
}
