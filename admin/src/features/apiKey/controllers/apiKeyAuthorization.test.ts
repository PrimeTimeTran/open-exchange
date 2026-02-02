import { ApiKey, Tenant } from '@prisma/client';
import dayjs from 'dayjs';
import { apiKeyCreateController } from 'src/features/apiKey/controllers/apiKeyCreateController';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { membershipAutocompleteController } from 'src/features/membership/controllers/membershipAutocompleteController';
import { permissions } from 'src/features/permissions';
import { roles } from 'src/features/roles';
import { UserWithMemberships } from 'src/features/user/userSchemas';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

describe('apiKeyAuthorization', () => {
  let prisma = prismaDangerouslyBypassAuth();
  let currentTenant: Tenant;
  let otherUser: UserWithMemberships;
  let otherApiKey: ApiKey;
  let otherApiKeyBearer: string;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_TENANT_MODE = 'single';
  });

  beforeEach(async () => {
    await authSignUpController(
      {
        email: 'other@scaffoldhub.io',
        password: '12345678',
      },
      await testContext(),
    );

    currentTenant = await prisma.tenant.findFirstOrThrow();

    otherUser = await prisma.user.findFirstOrThrow({
      where: { email: 'other@scaffoldhub.io' },
      include: {
        memberships: true,
      },
    });

    prisma = prismaAuth({
      currentUser: otherUser,
      currentMembership: otherUser?.memberships?.[0],
      currentTenant,
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

    const { apiKey } = await apiKeyCreateController(
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

    otherApiKeyBearer = apiKey;

    otherApiKey = await prisma.apiKey.findFirstOrThrow({
      where: { name: 'Other' },
    });
  });

  it('authenticates using API Key', async () => {
    const context = await testContext({ apiKey: otherApiKeyBearer });
    await membershipAutocompleteController({}, context);
  });

  it('API Key limits to scopes', async () => {
    await prisma.apiKey.update({
      where: { id: otherApiKey.id },
      data: {
        // Random scope
        scopes: [permissions.apiKeyRead.id],
      },
    });

    const context = await testContext({
      apiKey: otherApiKeyBearer,
    });

    try {
      await membershipAutocompleteController({}, context);
      fail();
    } catch (error) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it('API Key scopes at max to role, even if declared scopes are more permissive', async () => {
    await prisma.apiKey.update({
      where: { id: otherApiKey.id },
      data: {
        // Admin Scope
        scopes: [permissions.membershipRead.id],
      },
    });

    const context = await testContext({
      apiKey: otherApiKeyBearer,
    });

    try {
      await membershipAutocompleteController({}, context);
      fail();
    } catch (error) {
      expect(error).toBeInstanceOf(Error403);
    }
  });
});
