import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { feeScheduleArchiveManyInputSchema as feeScheduleArchiveManyInputSchema } from 'src/features/feeSchedule/feeScheduleSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const feeScheduleArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/fee-schedule/archive',
  request: {
    query: feeScheduleArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function feeScheduleArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.feeScheduleArchive,
    context,
  );

  const { ids } = feeScheduleArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.feeSchedule.updateMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
    data: {
      archivedAt: new Date(),
      archivedByMembershipId: context.currentMembership!.id,
    },
  });
}
