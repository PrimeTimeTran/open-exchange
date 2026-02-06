import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { ledgerEntryRestoreManyInputSchema } from 'src/features/ledgerEntry/ledgerEntrySchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const ledgerEntryRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/ledger-entry/restore',
  request: {
    query: ledgerEntryRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function ledgerEntryRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.ledgerEntryRestore,
    context,
  );

  const { ids } = ledgerEntryRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.ledgerEntry.updateMany({
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
