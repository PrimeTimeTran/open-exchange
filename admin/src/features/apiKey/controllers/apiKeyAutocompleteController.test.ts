import { ApiKey, Tenant } from '@prisma/client';
import dayjs from 'dayjs';
import { apiKeyAutocompleteController } from 'src/features/apiKey/controllers/apiKeyAutocompleteController';
import { apiKeyCreateController } from 'src/features/apiKey/controllers/apiKeyCreateController';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { permissions } from 'src/features/permissions';
import { roles } from 'src/features/roles';
import { UserWithMemberships } from 'src/features/user/userSchemas';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

describe('apiKeyAutocomplete', () => {
  let prisma = prismaDangerouslyBypassAuth();
  let adminUser: UserWithMemberships;
  let otherUser: UserWithMemberships;

  let currentTenant: Tenant;

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

    await prisma.apiKey.findFirstOrThrow({
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
      await apiKeyAutocompleteController({}, await testContext());
      fail();
    } catch (error) {
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
      await apiKeyAutocompleteController(
        {},
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

  it(`non admins can't view keys of others`, async () => {
    const data = await apiKeyAutocompleteController(
      {
        search: 'Admin',
      },
      await testContext({
        currentUserId: otherUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    expect(data.length).toBe(0);
  });

  it(`non admins can only view their own API keys`, async () => {
    const data = await apiKeyAutocompleteController(
      {},
      await testContext({
        currentUserId: otherUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    expect(data.length).toBe(1);
  });

  it(`admins can view other members API keys`, async () => {
    const data = await apiKeyAutocompleteController(
      {},
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    expect(data.length).toBe(2);
  });
});
