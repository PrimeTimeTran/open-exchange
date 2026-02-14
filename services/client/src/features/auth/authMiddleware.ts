import dayjs from 'dayjs';
import { trim } from 'lodash';
import { NextRequest } from 'next/server';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { MembershipStatus } from 'src/features/membership/MembershipStatus';
import { subscriptionFindActive } from 'src/features/subscription/subscriptionFindActive';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error401 from 'src/shared/errors/Error401';
import { cookieGet } from 'src/shared/lib/cookie';
import { hashSecret } from 'src/shared/lib/hashSecret';
import { isHashEqual } from 'src/shared/lib/isHashEqual';
import { jwtVerify } from 'src/shared/lib/jwt';

const prisma = prismaDangerouslyBypassAuth();

export async function authMiddleware(req: NextRequest, context: AppContext) {
  let tokenOrApiKey: string | undefined = extractTokenOrApiKeyFromHeader(req);

  if (!tokenOrApiKey) {
    tokenOrApiKey = cookieGet(req.cookies, 'token');
  }

  if (!tokenOrApiKey) {
    return context;
  }

  if (isJwtToken(tokenOrApiKey)) {
    const tenantId = cookieGet(req.cookies, 'tenant') || null;
    await authenticateWithJwtToken(tokenOrApiKey, tenantId, context);
  } else {
    await authenticateWithApiKey(tokenOrApiKey, context);
  }

  return context;
}

export function extractTokenOrApiKeyFromHeader(req: NextRequest) {
  const authorizationHeader = trim(req.headers.get('Authorization') || '');
  let tokenOrApiKey = authorizationHeader;
  if (authorizationHeader.includes(' ')) {
    tokenOrApiKey = authorizationHeader.split(' ')[1];
  }
  return tokenOrApiKey;
}

function isJwtToken(token: string) {
  try {
    const response = jwtVerify(token);

    if (!response) {
      throw new Error();
    }

    return true;
  } catch {
    return false;
  }
}

export async function authenticateWithApiKey(
  apiKeyString: string,
  context: AppContext,
) {
  if (!apiKeyString?.includes('.')) {
    throw new Error401(context.dictionary.auth.errors.invalidApiKey);
  }

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      keyPrefix: apiKeyString.split('.')[0],
    },
  });

  if (!apiKey) {
    throw new Error401(context.dictionary.auth.errors.invalidApiKey);
  }

  const secretFromRequest = apiKeyString.split('.')[1];

  if (!(await isHashEqual(secretFromRequest, apiKey?.secret))) {
    throw new Error401(context.dictionary.auth.errors.invalidApiKey);
  }

  if (apiKey.disabledAt) {
    throw new Error401(context.dictionary.auth.errors.invalidApiKey);
  }

  if (apiKey && apiKey.expiresAt && dayjs(apiKey.expiresAt).isBefore(dayjs())) {
    throw new Error401(context.dictionary.auth.errors.invalidApiKey);
  }

  let membership = await prisma.membership.findUniqueOrThrow({
    where: {
      id: apiKey.membershipId,
    },
    include: {
      user: {
        select: {
          email: true,
          emailVerified: true,
          expireSessionsOlderThan: true,
          id: true,
        },
      },
      tenant: true,
    },
  });

  membership = await filePopulateDownloadUrlInTree(membership);

  context.apiKey = apiKey;
  context.currentUser = membership.user as any;
  context.currentMembership = membership;
  context.currentTenant = membership.tenant;
  context.currentSubscription = await subscriptionFindActive(context);

  return context;
}

export async function authenticateWithJwtToken(
  token: string,
  tenantId: string | null | undefined,
  context: AppContext,
) {
  let decodedJwtToken = jwtVerify(token);

  if (!decodedJwtToken) {
    throw new Error401(`Invalid token`);
  }

  let currentUser = await prisma.user.findFirst({
    where: {
      id: decodedJwtToken.id,
    },
    select: {
      email: true,
      emailVerified: true,
      expireSessionsOlderThan: true,
      id: true,
      memberships: {
        include: {
          tenant: true,
        },
      },
    },
  });

  if (!currentUser) {
    throw new Error401(`User not found`);
  }

  if (currentUser.expireSessionsOlderThan) {
    const jwtTokenCreatedAt = dayjs.unix(decodedJwtToken.iat);

    if (jwtTokenCreatedAt.isBefore(currentUser.expireSessionsOlderThan)) {
      throw new Error401(`Session expired`);
    }
  }

  const activeMemberships = currentUser.memberships.filter((membership) =>
    MembershipStatus.isActive(membership),
  );

  let currentMembership;

  if (activeMemberships.length === 1) {
    currentMembership = activeMemberships[0];

    if (tenantId && currentMembership.tenantId !== tenantId) {
      throw new Error401(`Invalid tenant`);
    }
  } else {
    currentMembership = activeMemberships.find((membership) => {
      return membership.tenantId === tenantId;
    });

    if (!currentMembership && activeMemberships.length > 0) {
      currentMembership = activeMemberships[0];
    }
  }

  currentMembership = await filePopulateDownloadUrlInTree(currentMembership);

  context.currentUser = currentUser as any;
  context.currentMembership = currentMembership;
  context.currentTenant = currentMembership?.tenant;
  // @ts-ignore
  context.currentSubscription = await subscriptionFindActive(context);
  return context;
}
