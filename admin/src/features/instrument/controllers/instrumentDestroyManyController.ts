import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { instrumentDestroyManyInputSchema } from 'src/features/instrument/instrumentSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const instrumentDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/instrument',
  request: {
    query: instrumentDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function instrumentDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.instrumentDestroy,
    context,
  );

  const { ids } = instrumentDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.instrument.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
