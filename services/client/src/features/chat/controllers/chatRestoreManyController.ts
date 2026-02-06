import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chatRestoreManyInputSchema } from 'src/features/chat/chatSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const chatRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/chat/restore',
  request: {
    query: chatRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function chatRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chatRestore,
    context,
  );

  const { ids } = chatRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.chat.updateMany({
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
