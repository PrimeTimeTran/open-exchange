import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { ledgerEventDestroyManyInputSchema } from 'src/features/ledgerEvent/ledgerEventSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const ledgerEventDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/ledger-event',
  request: {
    query: ledgerEventDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function ledgerEventDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.ledgerEventDestroy,
    context,
  );

  const { ids } = ledgerEventDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.ledgerEvent.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
