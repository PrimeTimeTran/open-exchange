import { subscriptionSelectAndValidateDefaultMode } from 'src/features/subscription/subscriptionSelectAndValidateDefaultMode';
import { subscriptionStatuses } from 'src/features/subscription/subscriptionStatuses';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export async function subscriptionFindActive(context: AppContext) {
  const subscriptionMode = subscriptionSelectAndValidateDefaultMode(context);

  let criteriaAnd = [];

  criteriaAnd.push({ status: { in: subscriptionStatuses.active } });
  criteriaAnd.push({ mode: subscriptionMode });

  if (subscriptionMode === 'user') {
    criteriaAnd.push({
      userId: context.currentUser?.id,
    });
  }

  if (subscriptionMode === 'tenant') {
    criteriaAnd.push({
      tenantId: context.currentTenant?.id,
    });
  }

  if (subscriptionMode === 'membership') {
    criteriaAnd.push({
      userId: context.currentUser?.id,
      tenantId: context.currentTenant?.id,
      membershipId: context.currentMembership?.id,
    });
  }

  const prisma = prismaAuth(context);
  return await prisma.subscription.findFirst({
    where: {
      AND: criteriaAnd,
    },
  });
}
