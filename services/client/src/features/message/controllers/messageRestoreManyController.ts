import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { messageRestoreManyInputSchema } from 'src/features/message/messageSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const messageRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/message/restore',
  request: {
    query: messageRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function messageRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.messageRestore,
    context,
  );

  const { ids } = messageRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.message.updateMany({
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
