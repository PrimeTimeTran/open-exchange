import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { systemAccountDestroyManyInputSchema } from 'src/features/systemAccount/systemAccountSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const systemAccountDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/system-account',
  request: {
    query: systemAccountDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function systemAccountDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.systemAccountDestroy,
    context,
  );

  const { ids } = systemAccountDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.systemAccount.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
