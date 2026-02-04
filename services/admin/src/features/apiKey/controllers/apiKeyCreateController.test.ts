import { Tenant, User } from '@prisma/client';
import dayjs from 'dayjs';
import { times } from 'lodash';
import { apiKeyCreateController } from 'src/features/apiKey/controllers/apiKeyCreateController';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { permissions } from 'src/features/permissions';
import { roles } from 'src/features/roles';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';
import { formatTranslation } from 'src/translation/formatTranslation';

async function buildApiKey() {
  return {
    name: 'Test API Key',
    scopes: Object.values(permissions)
      .filter((permission) => permission.allowedRoles.includes(roles.custom))
      .map((permission) => permission.id),
    expiresAt: dayjs().add(1, 'day').toISOString(),
  };
}

describe('apiKeyCreate', () => {
  const prisma = prismaDangerouslyBypassAuth();
  let currentUser: User;
  let currentTenant: Tenant;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_TENANT_MODE = 'single';
  });

  beforeEach(async () => {
    await authSignUpController(
      {
        email: 'felipe@scaffoldhub.io',
        password: '12345678',
      },
      await testContext(),
    );

    currentUser = await prisma.user.findFirstOrThrow();
    currentTenant = await prisma.tenant.findFirstOrThrow();
  });

  it('must be signed in', async () => {
    const body = await buildApiKey();
    try {
      await apiKeyCreateController(body, await testContext());
      fail();
    } catch (error) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it('must have permission', async () => {
    const _prismaAuth = prismaDangerouslyBypassAuth({
      currentUser,
    });

    // remove permissions from user
    await _prismaAuth.membership.updateMany({
      data: {
        roles: [],
      },
    });

    const body = await buildApiKey();

    try {
      await apiKeyCreateController(
        body,
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it('creates and returns api key that starts with prefix', async () => {
    const body = await buildApiKey();

    const { apiKey } = await apiKeyCreateController(
      body,
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    const apiKeyFromDatabase = await prisma.apiKey.findFirst({});

    expect(apiKey).toContain(`${apiKeyFromDatabase?.keyPrefix}.`);
  });

  it('expiration date must be in the future', async () => {
    const body = await buildApiKey();

    body.expiresAt = dayjs().subtract(1, 'day').toISOString();

    try {
      await apiKeyCreateController(
        body,
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error: any) {
      expect(error.errors[0].message).toEqual(
        formatTranslation(
          dictionary.shared.errors.dateFuture,
          dictionary.apiKey.fields.expiresAt,
        ),
      );
    }
  });

  it(`scopes must be within user's role`, async () => {
    const _prismaAuth = prismaDangerouslyBypassAuth({
      currentUser,
    });

    await _prismaAuth.membership.updateMany({
      data: {
        roles: [roles.custom],
      },
    });

    const body = await buildApiKey();

    // Admin roles (not allowed)
    body.scopes = Object.values(permissions)
      .filter((permission) => permission.allowedRoles.includes(roles.admin))
      .map((permission) => permission.id);

    try {
      await apiKeyCreateController(
        body,
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error: any) {
      expect(error.errors[0].message).toEqual(
        dictionary.apiKey.errors.invalidScopes,
      );
    }
  });

  it(`name is required`, async () => {
    const body = await buildApiKey();

    body.name = '';

    try {
      await apiKeyCreateController(
        body,
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      fail();
    } catch (error: any) {
      expect(error.errors[0].path).toEqual(['name']);
      expect(error.errors[0].code).toEqual('too_small');
    }
  });

  it(`name can contain max of 255 characters`, async () => {
    const body = await buildApiKey();

    body.name = times(256, () => 'a').join('');

    try {
      await apiKeyCreateController(
        body,
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      fail();
    } catch (error: any) {
      expect(error.errors[0].path).toEqual(['name']);
      expect(error.errors[0].code).toEqual('too_big');
    }
  });
});
