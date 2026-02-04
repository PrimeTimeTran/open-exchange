import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  feeScheduleAutocompleteInputSchema,
  feeScheduleAutocompleteOutputSchema,
} from 'src/features/feeSchedule/feeScheduleSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const feeScheduleAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/fee-schedule/autocomplete',
  request: {
    query: feeScheduleAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(feeScheduleAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function feeScheduleAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.feeScheduleAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    feeScheduleAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.FeeScheduleWhereInput> = [];

  whereAnd.push({ tenantId: currentTenant.id });

  whereAnd.push({ archivedAt: null });

  if (exclude) {
    whereAnd.push({
      id: {
        notIn: exclude,
      },
    });
  }

  if (search) {
    whereAnd.push({
      id: search,
    });
  }

  let feeSchedules = await prisma.feeSchedule.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return feeSchedules.map((feeSchedule) => {
    return {
      id: feeSchedule.id,
    };
  });
}
