import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  candidateAutocompleteInputSchema,
  candidateAutocompleteOutputSchema,
} from 'src/features/candidate/candidateSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const candidateAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/candidate/autocomplete',
  request: {
    query: candidateAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(candidateAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function candidateAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.candidateAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    candidateAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.CandidateWhereInput> = [];

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
      email: {
        contains: search,
        mode: 'insensitive',
      },
    });
  }

  let candidates = await prisma.candidate.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return candidates.map((candidate) => {
    return {
      id: candidate.id,
    email: String(candidate.email),
    };
  });
}
