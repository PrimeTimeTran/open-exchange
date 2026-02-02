import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { membershipDestroyManyInputSchema } from 'src/features/membership/membershipSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { subscriptionCancelOnStripe } from 'src/features/subscription/subscriptionCancelOnStripe';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import Error404 from 'src/shared/errors/Error404';

export const membershipDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/membership',
  request: {
    query: membershipDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function membershipDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.membershipDestroy, context);

  const prisma = prismaAuth(context);

  const { ids } = membershipDestroyManyInputSchema.parse(query);

  const memberships = await prisma.membership.findMany({
    where: { id: { in: ids }, tenantId: String(context?.currentTenant?.id) },
  });

  if (memberships.length !== ids.length) {
    throw new Error404();
  }

  const isDeletingSelf = memberships.some(
    (membership) => membership.userId === context.currentUser?.id,
  );

  if (isDeletingSelf) {
    throw new Error400(context.dictionary.membership.errors.cannotDeleteSelf);
  }

  for (let membership of memberships) {
    await subscriptionCancelOnStripe(
      membership.userId,
      membership.tenantId,
      context,
    );

    await prisma.membership.delete({
      where: { id: membership.id },
    });
  }
}
