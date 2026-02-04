import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chatDestroyManyInputSchema } from 'src/features/chat/chatSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const chatDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/chat',
  request: {
    query: chatDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function chatDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chatDestroy,
    context,
  );

  const { ids } = chatDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.chat.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
