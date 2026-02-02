import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  ledgerEventUpdateBodyInputSchema,
  ledgerEventUpdateParamsInputSchema,
} from 'src/features/ledgerEvent/ledgerEventSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const ledgerEventUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/ledger-event/{id}',
  request: {
    params: ledgerEventUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: ledgerEventUpdateBodyInputSchema,
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

export async function ledgerEventUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.ledgerEventUpdate,
    context,
  );

  const { id } = ledgerEventUpdateParamsInputSchema.parse(params);

  const data = ledgerEventUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.ledgerEvent.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      type: data.type,
      referenceId: data.referenceId,
      referenceType: data.referenceType,
      status: data.status,
      description: data.description,
      meta: data.meta,
    },
  });

  let ledgerEvent = await prisma.ledgerEvent.findUniqueOrThrow({
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
