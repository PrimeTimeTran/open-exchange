import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { ledgerEventFindSchema } from 'src/features/ledgerEvent/ledgerEventSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const ledgerEventFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/ledger-event/{id}',
  request: {
    params: ledgerEventFindSchema,
  },
  responses: {
    200: {
      description: 'LedgerEvent',
    },
  },
};

export async function ledgerEventFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.ledgerEventRead,
    context,
  );

  const { id } = ledgerEventFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let ledgerEvent = await prisma.ledgerEvent.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      entries: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  ledgerEvent = await filePopulateDownloadUrlInTree(ledgerEvent);

  return ledgerEvent;
}
