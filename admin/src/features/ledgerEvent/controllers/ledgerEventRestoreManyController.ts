import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { ledgerEventRestoreManyInputSchema } from 'src/features/ledgerEvent/ledgerEventSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const ledgerEventRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/ledger-event/restore',
  request: {
    query: ledgerEventRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function ledgerEventRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.ledgerEventRestore,
    context,
  );

  const { ids } = ledgerEventRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.ledgerEvent.updateMany({
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
