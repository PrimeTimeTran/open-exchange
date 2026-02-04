import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  feeScheduleUpdateBodyInputSchema,
  feeScheduleUpdateParamsInputSchema,
} from 'src/features/feeSchedule/feeScheduleSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const feeScheduleUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/fee-schedule/{id}',
  request: {
    params: feeScheduleUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: feeScheduleUpdateBodyInputSchema,
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

export async function feeScheduleUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.feeScheduleUpdate,
    context,
  );

  const { id } = feeScheduleUpdateParamsInputSchema.parse(params);

  const data = feeScheduleUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.feeSchedule.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
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
    },
  });

  let feeSchedule = await prisma.feeSchedule.findUniqueOrThrow({
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

  feeSchedule = await filePopulateDownloadUrlInTree(feeSchedule);

  return feeSchedule;
}
