import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { jobFindManyInputSchema } from 'src/features/job/jobSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const jobFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/job',
  request: {
    query: jobFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ jobs: Job[], count: number }',
    },
  },
};

export async function jobFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.jobRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    jobFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.JobWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.title != null) {
    whereAnd.push({
      title: { contains: filter?.title, mode: 'insensitive' },
    });
  }

  if (filter?.team != null) {
    whereAnd.push({
      team: { contains: filter?.team, mode: 'insensitive' },
    });
  }

  if (filter?.location != null) {
    whereAnd.push({
      location: { contains: filter?.location, mode: 'insensitive' },
    });
  }

  if (filter?.type != null) {
    whereAnd.push({
      type: filter?.type,
    });
  }

  if (filter?.remote != null) {
    whereAnd.push({
      remote: filter.remote,
    });
  }

  if (filter?.description != null) {
    whereAnd.push({
      description: { contains: filter?.description, mode: 'insensitive' },
    });
  }

  if (filter?.requirements != null) {
    whereAnd.push({
      requirements: { contains: filter?.requirements, mode: 'insensitive' },
    });
  }

  if (filter?.responsibilities != null) {
    whereAnd.push({
      responsibilities: { contains: filter?.responsibilities, mode: 'insensitive' },
    });
  }

  if (filter?.quantityRange?.length) {
    const start = filter.quantityRange?.[0];
    const end = filter.quantityRange?.[1];

    if (start != null) {
      whereAnd.push({
        quantity: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        quantity: { lte: end },
      });
    }
  }

  if (filter?.salaryLowRange?.length) {
    const start = filter.salaryLowRange?.[0];
    const end = filter.salaryLowRange?.[1];

    if (start != null) {
      whereAnd.push({
        salaryLow: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        salaryLow: { lte: end },
      });
    }
  }

  if (filter?.salaryHighRange?.length) {
    const start = filter.salaryHighRange?.[0];
    const end = filter.salaryHighRange?.[1];

    if (start != null) {
      whereAnd.push({
        salaryHigh: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        salaryHigh: { lte: end },
      });
    }
  }

  if (filter?.status != null) {
    whereAnd.push({
      status: filter?.status,
    });
  }

  if (filter?.seniority != null) {
    whereAnd.push({
      seniority: filter?.seniority,
    });
  }

  if (filter?.currency != null) {
    whereAnd.push({
      currency: { contains: filter?.currency, mode: 'insensitive' },
    });
  }

  const prisma = prismaAuth(context);

  let jobs = await prisma.job.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.job.count({
    where: {
      AND: whereAnd,
    },
  });

  jobs = await filePopulateDownloadUrlInTree(jobs);

  return { jobs, count };
}
