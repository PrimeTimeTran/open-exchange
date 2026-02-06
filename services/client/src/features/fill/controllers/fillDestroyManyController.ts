import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { fillDestroyManyInputSchema } from 'src/features/fill/fillSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const fillDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/fill',
  request: {
    query: fillDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function fillDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.fillDestroy,
    context,
  );

  const { ids } = fillDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.fill.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
