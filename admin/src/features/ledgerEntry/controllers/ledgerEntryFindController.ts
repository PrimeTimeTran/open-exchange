import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { ledgerEntryFindSchema } from 'src/features/ledgerEntry/ledgerEntrySchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const ledgerEntryFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/ledger-entry/{id}',
  request: {
    params: ledgerEntryFindSchema,
  },
  responses: {
    200: {
      description: 'LedgerEntry',
    },
  },
};

export async function ledgerEntryFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.ledgerEntryRead,
    context,
  );

  const { id } = ledgerEntryFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let ledgerEntry = await prisma.ledgerEntry.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      event: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  ledgerEntry = await filePopulateDownloadUrlInTree(ledgerEntry);

  return ledgerEntry;
}
