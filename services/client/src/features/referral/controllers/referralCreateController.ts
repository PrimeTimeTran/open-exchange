import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { referralCreateInputSchema } from 'src/features/referral/referralSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const referralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/referral',
  request: {
    body: {
      content: {
        'application/json': {
          schema: referralCreateInputSchema,
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

export async function referralCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.referralCreate, context);
  return await referralCreate(body, context);
}

export async function referralCreate(body: unknown, context: AppContext) {
  const data = referralCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let referral = await prisma.referral.create({
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
      importHash: data.importHash,
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
