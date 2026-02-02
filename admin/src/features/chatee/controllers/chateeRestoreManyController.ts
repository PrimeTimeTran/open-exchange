import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chateeRestoreManyInputSchema } from 'src/features/chatee/chateeSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const chateeRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/chatee/restore',
  request: {
    query: chateeRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function chateeRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chateeRestore,
    context,
  );

  const { ids } = chateeRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.chatee.updateMany({
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
