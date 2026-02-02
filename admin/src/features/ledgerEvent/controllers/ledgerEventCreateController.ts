import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { ledgerEventCreateInputSchema } from 'src/features/ledgerEvent/ledgerEventSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const ledgerEventCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/ledger-event',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ledgerEventCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'LedgerEvent',
    },
  },
};

export async function ledgerEventCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.ledgerEventCreate, context);
  return await ledgerEventCreate(body, context);
}

export async function ledgerEventCreate(body: unknown, context: AppContext) {
  const data = ledgerEventCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let ledgerEvent = await prisma.ledgerEvent.create({
    data: {
      type: data.type,
      referenceType: data.referenceType,
      importHash: data.importHash,
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
