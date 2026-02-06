import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { referralDestroyManyInputSchema } from 'src/features/referral/referralSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const referralDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/referral',
  request: {
    query: referralDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function referralDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.referralDestroy,
    context,
  );

  const { ids } = referralDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.referral.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
