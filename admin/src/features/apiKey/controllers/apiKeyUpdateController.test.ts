import { ApiKey, Tenant, User } from '@prisma/client';
import dayjs from 'dayjs';
import { times } from 'lodash';
import { apiKeyCreateController } from 'src/features/apiKey/controllers/apiKeyCreateController';
import { apiKeyUpdateController } from 'src/features/apiKey/controllers/apiKeyUpdateController';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { permissions } from 'src/features/permissions';
import { roles } from 'src/features/roles';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';
import { ZodError } from 'zod';

describe('apiKeyUpdate', () => {
  let prisma = prismaDangerouslyBypassAuth();
  let adminUser: User;
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

    adminApiKey = await prisma.apiKey.findFirstOrThrow({
      where: { name: 'Admin' },
    });
  });

  it('own API Key - updates name, scopes, expiresAt and disable/enable', async () => {
    let updateBody = {
      name: 'Updated Name',
      expiresAt: dayjs().add(2, 'day').toISOString(),
      disabled: true,
      scopes: [permissions.apiKeyRead.id],
    };

    await apiKeyUpdateController(
      { id: otherApiKey.id },
      updateBody,
      await testContext({
        currentUserId: otherUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    const updatedApiKey = await prisma.apiKey.findUniqueOrThrow({
      where: {
        id: otherApiKey.id,
      },
    });

    expect(updatedApiKey.keyPrefix).toBeTruthy();
    expect(updatedApiKey.secret).toBeTruthy();
    expect(updatedApiKey.name).toBe(updateBody.name);
    expect(updatedApiKey.scopes).toEqual(updateBody.scopes);
    expect(updatedApiKey.expiresAt?.toISOString()).toEqual(
      updateBody.expiresAt,
    );
    expect(updatedApiKey.disabledAt).toBeTruthy();

    let enableBody = {
      disabled: false,
    };

    await apiKeyUpdateController(
      { id: otherApiKey.id },
      enableBody,
      await testContext({
        currentUserId: otherUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );
    const enabledKey = await prisma.apiKey.findUniqueOrThrow({
      where: {
        id: otherApiKey.id,
      },
    });

    expect(enabledKey.disabledAt).toBeFalsy();
  });

  it('other API Key - as admin - updates name, scopes, expiresAt and disable/enable', async () => {
    let updateBody = {
      name: 'Updated Name',
      expiresAt: dayjs().add(2, 'day').toISOString(),
      disabled: true,
      scopes: [permissions.apiKeyRead.id],
    };

    await apiKeyUpdateController(
      { id: otherApiKey.id },
      updateBody,
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    const updatedApiKey = await prisma.apiKey.findUniqueOrThrow({
      where: {
        id: otherApiKey.id,
      },
    });

    expect(updatedApiKey.keyPrefix).toBeTruthy();
    expect(updatedApiKey.secret).toBeTruthy();
    expect(updatedApiKey.name).toBe(updateBody.name);
    expect(updatedApiKey.scopes).toEqual(updateBody.scopes);
    expect(updatedApiKey.expiresAt?.toISOString()).toEqual(
      updateBody.expiresAt,
    );
    expect(updatedApiKey.disabledAt).toBeTruthy();

    let enableBody = {
      disabled: false,
    };

    await apiKeyUpdateController(
      { id: otherApiKey.id },
      enableBody,
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    const enabledKey = await prisma.apiKey.findUniqueOrThrow({
      where: {
        id: otherApiKey.id,
      },
    });

    expect(enabledKey.disabledAt).toBeFalsy();
  });

  it(`non admins can't update other API Key`, async () => {
    let updateBody = {
      name: 'Updated Name',
    };

    try {
      await apiKeyUpdateController(
        { id: adminApiKey.id },
        updateBody,
        await testContext({
          currentUserId: otherUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it(`scopes must be within user's role`, async () => {
    const _prismaAuth = prismaDangerouslyBypassAuth({
      currentUser: otherUser,
    });

    await _prismaAuth.membership.updateMany({
      data: {
        roles: [roles.custom],
      },
    });

    // Admin roles (not allowed)
    let body = {
      scopes: Object.values(permissions)
        .filter((permission) => permission.allowedRoles.includes(roles.admin))
        .map((permission) => permission.id),
    };

    try {
      await apiKeyUpdateController(
        { id: otherApiKey.id },
        body,
        await testContext({
          currentUserId: otherUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        expect(error.errors[0].message).toBe(
          dictionary.apiKey.errors.invalidScopes,
        );
      }
    }
  });

  it(`name can contain max of 255 characters`, async () => {
    let body = {
      name: times(256, () => 'a').join(''),
    };

    try {
      await apiKeyUpdateController(
        { id: otherApiKey.id },
        body,
        await testContext({
          currentUserId: otherUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error: any) {
      expect(error.errors[0].path).toEqual(['name']);
      expect(error.errors[0].code).toBe('too_big');
    }
  });
});
