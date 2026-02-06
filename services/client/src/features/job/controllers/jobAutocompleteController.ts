import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  jobAutocompleteInputSchema,
  jobAutocompleteOutputSchema,
} from 'src/features/job/jobSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const jobAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/job/autocomplete',
  request: {
    query: jobAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(jobAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function jobAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.jobAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    jobAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.JobWhereInput> = [];

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

  let jobs = await prisma.job.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return jobs.map((job) => {
    return {
      id: job.id,
    };
  });
}
