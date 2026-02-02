import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chatArchiveManyInputSchema as chatArchiveManyInputSchema } from 'src/features/chat/chatSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const chatArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/chat/archive',
  request: {
    query: chatArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function chatArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chatArchive,
    context,
  );

  const { ids } = chatArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.chat.updateMany({
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
