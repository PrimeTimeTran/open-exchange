import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chateeDestroyManyInputSchema } from 'src/features/chatee/chateeSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const chateeDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/chatee',
  request: {
    query: chateeDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function chateeDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chateeDestroy,
    context,
  );

  const { ids } = chateeDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.chatee.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
