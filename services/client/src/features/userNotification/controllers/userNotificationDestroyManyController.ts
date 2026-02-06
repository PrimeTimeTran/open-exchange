import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { userNotificationDestroyManyInputSchema } from 'src/features/userNotification/userNotificationSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const userNotificationDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/user-notification',
  request: {
    query: userNotificationDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function userNotificationDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.userNotificationDestroy,
    context,
  );

  const { ids } = userNotificationDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.userNotification.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
