import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chateeArchiveManyInputSchema as chateeArchiveManyInputSchema } from 'src/features/chatee/chateeSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const chateeArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/chatee/archive',
  request: {
    query: chateeArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function chateeArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chateeArchive,
    context,
  );

  const { ids } = chateeArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.chatee.updateMany({
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
