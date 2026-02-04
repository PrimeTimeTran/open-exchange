import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { messageDestroyManyInputSchema } from 'src/features/message/messageSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const messageDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/message',
  request: {
    query: messageDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function messageDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.messageDestroy,
    context,
  );

  const { ids } = messageDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.message.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
