import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { ledgerEntryArchiveManyInputSchema as ledgerEntryArchiveManyInputSchema } from 'src/features/ledgerEntry/ledgerEntrySchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const ledgerEntryArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/ledger-entry/archive',
  request: {
    query: ledgerEntryArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function ledgerEntryArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.ledgerEntryArchive,
    context,
  );

  const { ids } = ledgerEntryArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.ledgerEntry.updateMany({
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
