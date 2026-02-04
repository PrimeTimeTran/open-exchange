import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { accountDestroyManyInputSchema } from 'src/features/account/accountSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const accountDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/account',
  request: {
    query: accountDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function accountDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.accountDestroy,
    context,
  );

  const { ids } = accountDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.account.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
