import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { referralFindManyInputSchema } from 'src/features/referral/referralSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const referralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/referral',
  request: {
    query: referralFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ referrals: Referral[], count: number }',
    },
  },
};

export async function referralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.referralRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    referralFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.ReferralWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.referrerUserId != null) {
    whereAnd.push({
      referrerUserId: { contains: filter?.referrerUserId, mode: 'insensitive' },
    });
  }

  if (filter?.referredUserId != null) {
    whereAnd.push({
      referredUserId: { contains: filter?.referredUserId, mode: 'insensitive' },
    });
  }

  if (filter?.referralCode != null) {
    whereAnd.push({
      referralCode: { contains: filter?.referralCode, mode: 'insensitive' },
    });
  }

  if (filter?.source != null) {
    whereAnd.push({
      source: filter?.source,
    });
  }

  if (filter?.status != null) {
    whereAnd.push({
      status: filter?.status,
    });
  }

  if (filter?.rewardType != null) {
    whereAnd.push({
      rewardType: filter?.rewardType,
    });
  }

  if (filter?.rewardAmountRange?.length) {
    const start = filter.rewardAmountRange?.[0];
    const end = filter.rewardAmountRange?.[1];

    if (start != null) {
      whereAnd.push({
        rewardAmount: { gte: start },
      });
    }

    if (end != null) {
      whereAnd.push({
        rewardAmount: { lte: end },
      });
    }
  }

  if (filter?.rewardCurrency != null) {
    whereAnd.push({
      rewardCurrency: { contains: filter?.rewardCurrency, mode: 'insensitive' },
    });
  }

  if (filter?.rewardedAtRange?.length) {
    const start = filter.rewardedAtRange?.[0];
    const end = filter.rewardedAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        rewardedAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        rewardedAt: {
          lte: end,
        },
      });
    }
  }

  const prisma = prismaAuth(context);

  let referrals = await prisma.referral.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.referral.count({
    where: {
      AND: whereAnd,
    },
  });

  referrals = await filePopulateDownloadUrlInTree(referrals);

  return { referrals, count };
}
