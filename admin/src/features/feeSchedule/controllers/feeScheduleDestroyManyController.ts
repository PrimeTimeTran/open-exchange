import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { feeScheduleDestroyManyInputSchema } from 'src/features/feeSchedule/feeScheduleSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const feeScheduleDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/fee-schedule',
  request: {
    query: feeScheduleDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function feeScheduleDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.feeScheduleDestroy,
    context,
  );

  const { ids } = feeScheduleDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.feeSchedule.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
