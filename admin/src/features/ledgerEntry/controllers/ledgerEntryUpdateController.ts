import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  ledgerEntryUpdateBodyInputSchema,
  ledgerEntryUpdateParamsInputSchema,
} from 'src/features/ledgerEntry/ledgerEntrySchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const ledgerEntryUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/ledger-entry/{id}',
  request: {
    params: ledgerEntryUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: ledgerEntryUpdateBodyInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'LedgerEntry',
    },
  },
};

export async function ledgerEntryUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.ledgerEntryUpdate,
    context,
  );

  const { id } = ledgerEntryUpdateParamsInputSchema.parse(params);

  const data = ledgerEntryUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.ledgerEntry.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      amount: data.amount,
      event: prismaRelationship.connectOrDisconnectOne(data.event),
    },
  });

  let ledgerEntry = await prisma.ledgerEntry.findUniqueOrThrow({
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
