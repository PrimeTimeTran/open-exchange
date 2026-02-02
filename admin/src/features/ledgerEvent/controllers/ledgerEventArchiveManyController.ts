import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { ledgerEventArchiveManyInputSchema as ledgerEventArchiveManyInputSchema } from 'src/features/ledgerEvent/ledgerEventSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const ledgerEventArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/ledger-event/archive',
  request: {
    query: ledgerEventArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function ledgerEventArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.ledgerEventArchive,
    context,
  );

  const { ids } = ledgerEventArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.ledgerEvent.updateMany({
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
