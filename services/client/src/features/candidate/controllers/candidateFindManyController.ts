import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { candidateFindManyInputSchema } from 'src/features/candidate/candidateSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const candidateFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/candidate',
  request: {
    query: candidateFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ candidates: Candidate[], count: number }',
    },
  },
};

export async function candidateFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.candidateRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    candidateFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.CandidateWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.firstName != null) {
    whereAnd.push({
      firstName: { contains: filter?.firstName, mode: 'insensitive' },
    });
  }

  if (filter?.lastName != null) {
    whereAnd.push({
      lastName: { contains: filter?.lastName, mode: 'insensitive' },
    });
  }

  if (filter?.preferredName != null) {
    whereAnd.push({
      preferredName: { contains: filter?.preferredName, mode: 'insensitive' },
    });
  }

  if (filter?.email != null) {
    whereAnd.push({
      email: { contains: filter?.email, mode: 'insensitive' },
    });
  }

  if (filter?.phone != null) {
    whereAnd.push({
      phone: { contains: filter?.phone, mode: 'insensitive' },
    });
  }

  if (filter?.country != null) {
    whereAnd.push({
      country: { contains: filter?.country, mode: 'insensitive' },
    });
  }

  if (filter?.timezone != null) {
    whereAnd.push({
      timezone: { contains: filter?.timezone, mode: 'insensitive' },
    });
  }

  if (filter?.linkedinUrl != null) {
    whereAnd.push({
      linkedinUrl: { contains: filter?.linkedinUrl, mode: 'insensitive' },
    });
  }

  if (filter?.githubUrl != null) {
    whereAnd.push({
      githubUrl: { contains: filter?.githubUrl, mode: 'insensitive' },
    });
  }

  if (filter?.portfolioUrl != null) {
    whereAnd.push({
      portfolioUrl: { contains: filter?.portfolioUrl, mode: 'insensitive' },
    });
  }

  if (filter?.resumeUrl != null) {
    whereAnd.push({
      resumeUrl: { contains: filter?.resumeUrl, mode: 'insensitive' },
    });
  }

  const prisma = prismaAuth(context);

  let candidates = await prisma.candidate.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.candidate.count({
    where: {
      AND: whereAnd,
    },
  });

  candidates = await filePopulateDownloadUrlInTree(candidates);

  return { candidates, count };
}
