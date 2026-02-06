import { ApiKey, Tenant, User } from '@prisma/client';
import dayjs from 'dayjs';
import { apiKeyCreateController } from 'src/features/apiKey/controllers/apiKeyCreateController';
import { apiKeyDestroyController } from 'src/features/apiKey/controllers/apiKeyDestroyController';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { permissions } from 'src/features/permissions';
import { roles } from 'src/features/roles';
import { UserWithMemberships } from 'src/features/user/userSchemas';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

describe('apiKeyDestroy', () => {
  let prisma = prismaDangerouslyBypassAuth();
  let adminUser: UserWithMemberships;
  let otherUser: User;
  let currentTenant: Tenant;
  let otherApiKey: ApiKey;
  let adminApiKey: ApiKey;

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

    prisma = prismaAuth({
      currentUser: adminUser,
      currentMembership: adminUser.memberships?.[0],
      currentTenant,
    });

    await authSignUpController(
      {
        email: 'other@scaffoldhub.io',
        password: '12345678',
      },
      await testContext(),
    );

    otherUser = await prisma.user.findFirstOrThrow({
      where: { email: 'other@scaffoldhub.io' },
    });

    await prisma.membership.updateMany({
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

    adminApiKey = await prisma.apiKey.findFirstOrThrow({
      where: { name: 'Admin' },
    });
  });

  it('must be signed in', async () => {
    try {
      await apiKeyDestroyController(
        { id: otherApiKey.id },
        await testContext(),
      );
      fail();
    } catch (error) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it('must have permission', async () => {
    // remove permissions from user
    await prisma.membership.updateMany({
      data: {
        roles: [],
      },
    });

    try {
      await apiKeyDestroyController(
        { id: otherApiKey.id },
        await testContext({
          currentUserId: adminUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it(`non admins can't remove API keys of others`, async () => {
    try {
      await apiKeyDestroyController(
        { id: adminApiKey.id },
        await testContext({
          currentUserId: otherUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('non admins can delete their own API keys', async () => {
    await apiKeyDestroyController(
      { id: otherApiKey.id },
      await testContext({
        currentUserId: otherUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    const count = await prisma.apiKey.count({ where: { name: 'Other' } });
    expect(count).toBe(0);
  });

  it('admins can delete others API keys', async () => {
    await apiKeyDestroyController(
      { id: otherApiKey.id },
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    const count = await prisma.apiKey.count({ where: { name: 'Other' } });
    expect(count).toBe(0);
  });
});
