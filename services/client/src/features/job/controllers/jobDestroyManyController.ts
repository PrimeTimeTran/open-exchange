import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { jobDestroyManyInputSchema } from 'src/features/job/jobSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const jobDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/job',
  request: {
    query: jobDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function jobDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.jobDestroy,
    context,
  );

  const { ids } = jobDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.job.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
