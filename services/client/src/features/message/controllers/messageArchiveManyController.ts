import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { messageArchiveManyInputSchema as messageArchiveManyInputSchema } from 'src/features/message/messageSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const messageArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/message/archive',
  request: {
    query: messageArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function messageArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.messageArchive,
    context,
  );

  const { ids } = messageArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.message.updateMany({
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
