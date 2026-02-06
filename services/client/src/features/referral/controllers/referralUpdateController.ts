import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  referralUpdateBodyInputSchema,
  referralUpdateParamsInputSchema,
} from 'src/features/referral/referralSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const referralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/referral/{id}',
  request: {
    params: referralUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: referralUpdateBodyInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Referral',
    },
  },
};

export async function referralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.referralUpdate,
    context,
  );

  const { id } = referralUpdateParamsInputSchema.parse(params);

  const data = referralUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.referral.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      referrerUserId: data.referrerUserId,
      referredUserId: data.referredUserId,
      referralCode: data.referralCode,
      source: data.source,
      status: data.status,
      rewardType: data.rewardType,
      rewardAmount: data.rewardAmount,
      rewardCurrency: data.rewardCurrency,
      rewardedAt: data.rewardedAt,
      meta: data.meta,
    },
  });

  let referral = await prisma.referral.findUniqueOrThrow({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {

      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  referral = await filePopulateDownloadUrlInTree(referral);

  return referral;
}
