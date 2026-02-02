import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { feeScheduleCreateInputSchema } from 'src/features/feeSchedule/feeScheduleSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const feeScheduleCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/fee-schedule',
  request: {
    body: {
      content: {
        'application/json': {
          schema: feeScheduleCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'FeeSchedule',
    },
  },
};

export async function feeScheduleCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.feeScheduleCreate, context);
  return await feeScheduleCreate(body, context);
}

export async function feeScheduleCreate(body: unknown, context: AppContext) {
  const data = feeScheduleCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let feeSchedule = await prisma.feeSchedule.create({
    data: {
      scope: data.scope,
      makerFeeBps: data.makerFeeBps,
      takerFeeBps: data.takerFeeBps,
      minFeeAmount: data.minFeeAmount,
      effectiveFrom: data.effectiveFrom,
      effectiveTo: data.effectiveTo,
      tier: data.tier,
      accountId: data.accountId,
      instrumentId: data.instrumentId,
      meta: data.meta,
      importHash: data.importHash,
    },
    include: {

      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  feeSchedule = await filePopulateDownloadUrlInTree(feeSchedule);

  return feeSchedule;
}
