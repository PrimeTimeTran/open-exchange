import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { ledgerEntryDestroyManyInputSchema } from 'src/features/ledgerEntry/ledgerEntrySchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const ledgerEntryDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/ledger-entry',
  request: {
    query: ledgerEntryDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function ledgerEntryDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.ledgerEntryDestroy,
    context,
  );

  const { ids } = ledgerEntryDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.ledgerEntry.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
