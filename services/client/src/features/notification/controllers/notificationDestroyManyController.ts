import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { notificationDestroyManyInputSchema } from 'src/features/notification/notificationSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const notificationDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/notification',
  request: {
    query: notificationDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function notificationDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.notificationDestroy,
    context,
  );

  const { ids } = notificationDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.notification.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
