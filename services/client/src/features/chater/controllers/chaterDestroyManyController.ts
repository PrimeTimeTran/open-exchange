import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { chaterDestroyManyInputSchema } from 'src/features/chater/chaterSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const chaterDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/chater',
  request: {
    query: chaterDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function chaterDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chaterDestroy,
    context,
  );

  const { ids } = chaterDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.chater.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
