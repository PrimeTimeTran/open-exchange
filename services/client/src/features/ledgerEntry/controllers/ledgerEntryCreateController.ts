import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { ledgerEntryCreateInputSchema } from 'src/features/ledgerEntry/ledgerEntrySchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const ledgerEntryCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/ledger-entry',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ledgerEntryCreateInputSchema,
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

export async function ledgerEntryCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.ledgerEntryCreate, context);
  return await ledgerEntryCreate(body, context);
}

export async function ledgerEntryCreate(body: unknown, context: AppContext) {
  const data = ledgerEntryCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let ledgerEntry = await prisma.ledgerEntry.create({
    data: {
      amount: data.amount,
      accountId: data.accountId,
      meta: data.meta,
      event: prismaRelationship.connectOne(data.event),
      importHash: data.importHash,
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
