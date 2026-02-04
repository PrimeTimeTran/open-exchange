import { ApiKey, Tenant } from '@prisma/client';
import dayjs from 'dayjs';
import { apiKeyCreateController } from 'src/features/apiKey/controllers/apiKeyCreateController';
import { apiKeyFindManyController } from 'src/features/apiKey/controllers/apiKeyFindManyController';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { permissions } from 'src/features/permissions';
import { roles } from 'src/features/roles';
import { UserWithMemberships } from 'src/features/user/userSchemas';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

describe('apiKeyFindMany', () => {
  let prisma = prismaDangerouslyBypassAuth();
  let adminUser: UserWithMemberships;
  let otherUser: UserWithMemberships;

  let currentTenant: Tenant;
  let otherApiKey: ApiKey;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_TENANT_MODE = 'single';
  });

  beforeEach(async () => {
    await authSignUpController(
      {
        email: 'admin@scaffoldhub.io',
        password: '12345678',
      },
      await testContext(),
    );

    adminUser = await prisma.user.findFirstOrThrow({
      where: { email: 'admin@scaffoldhub.io' },
      include: {
        memberships: true,
      },
    });

    currentTenant = await prisma.tenant.findFirstOrThrow();

    await authSignUpController(
      {
        email: 'other@scaffoldhub.io',
        password: '12345678',
      },
      await testContext(),
    );

    otherUser = await prisma.user.findFirstOrThrow({
      where: { email: 'other@scaffoldhub.io' },
      include: {
        memberships: true,
      },
    });

    const _prismaAuth = prismaDangerouslyBypassAuth({
      currentUser: otherUser,
    });

    await _prismaAuth.membership.updateMany({
      where: {
        tenantId: currentTenant.id,
        userId: otherUser.id,
      },
      data: {
        roles: [roles.custom],
      },
    });

    await apiKeyCreateController(
      {
        name: 'Other',
        scopes: Object.values(permissions)
          .filter((permission) =>
            permission.allowedRoles.includes(roles.custom),
          )
          .map((permission) => permission.id),
        expiresAt: dayjs().add(1, 'day').toISOString(),
      },
      await testContext({
        currentUserId: otherUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    otherApiKey = await prisma.apiKey.findFirstOrThrow({
      where: { name: 'Other' },
    });

    await apiKeyCreateController(
      {
        name: 'Admin',
        scopes: Object.values(permissions)
          .filter((permission) => permission.allowedRoles.includes(roles.admin))
          .map((permission) => permission.id),
        expiresAt: dayjs().add(1, 'day').toISOString(),
      },
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    await prisma.apiKey.findFirstOrThrow({
      where: { name: 'Admin' },
    });
  });

  it('must be signed in', async () => {
    try {
      await apiKeyFindManyController({}, await testContext());
      fail();
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it('must have permission', async () => {
    const _prismaAuth = prismaDangerouslyBypassAuth({
      currentUser: adminUser,
    });

    // remove permissions from user
    await _prismaAuth.membership.updateMany({
      data: {
        roles: [],
      },
    });

    try {
      await apiKeyFindManyController(
        {},
        await testContext({
          currentUserId: adminUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it(`non admins can't view keys of others`, async () => {
    const { apiKeys } = await apiKeyFindManyController(
      {
        filter: {
          membership: adminUser?.memberships?.[0].id,
        },
      },
      await testContext({
        currentUserId: otherUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    expect(apiKeys.length).toBe(0);
  });

  it(`non admins can only view their own API keys`, async () => {
    const { apiKeys } = await apiKeyFindManyController(
      {},
      await testContext({
        currentUserId: otherUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    expect(apiKeys.length).toBe(1);
    expect(apiKeys[0].id).toBe(otherApiKey.id);
  });

  it(`admins can view other members API keys`, async () => {
    const { apiKeys } = await apiKeyFindManyController(
      {},
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    expect(apiKeys.length).toBe(2);
  });
});
