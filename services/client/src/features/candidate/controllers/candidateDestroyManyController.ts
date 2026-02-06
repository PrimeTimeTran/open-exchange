import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { candidateDestroyManyInputSchema } from 'src/features/candidate/candidateSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const candidateDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/candidate',
  request: {
    query: candidateDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function candidateDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.candidateDestroy,
    context,
  );

  const { ids } = candidateDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.candidate.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
