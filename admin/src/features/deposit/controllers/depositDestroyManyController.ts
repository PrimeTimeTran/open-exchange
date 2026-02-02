import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { depositDestroyManyInputSchema } from 'src/features/deposit/depositSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const depositDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/deposit',
  request: {
    query: depositDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function depositDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.depositDestroy,
    context,
  );

  const { ids } = depositDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.deposit.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
