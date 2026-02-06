import { ApiKey, Tenant, User } from '@prisma/client';
import dayjs from 'dayjs';
import { apiKeyCreateController } from 'src/features/apiKey/controllers/apiKeyCreateController';
import { auditLogOperations } from 'src/features/auditLog/auditLogOperations';
import { auditLogFindManyController } from 'src/features/auditLog/controllers/auditLogFindManyController';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { membershipAcceptInvitationController } from 'src/features/membership/controllers/membershipAcceptInvitationController';
import { membershipCreateController } from 'src/features/membership/controllers/membershipCreateController';
import { permissions } from 'src/features/permissions';
import { roles } from 'src/features/roles';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { UserWithMemberships } from 'src/features/user/userSchemas';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

const prisma = prismaDangerouslyBypassAuth();

describe('auditLogFindMany', () => {
  let adminUser: User;
  let otherUser: UserWithMemberships;

  let tenantA: Tenant;
  let tenantB: Tenant;

  let adminApiKeyBearer: string;
  let adminApiKey: ApiKey;

  beforeEach(async () => {
    process.env.NEXT_PUBLIC_TENANT_MODE = 'multi';

    await authSignUpController(
      {
        email: 'admin@scaffoldhub.io',
        password: '12345678',
      },
      await testContext(),
    );

    adminUser = await prisma.user.findFirstOrThrow();

    await tenantCreateController(
      { name: 'Tenant A' },
      await testContext({
        currentUserId: adminUser.id,
      }),
    );

    tenantA = await prisma.tenant.findFirstOrThrow({
      where: { name: 'Tenant A' },
    });

    await tenantCreateController(
      { name: 'Tenant B' },
      await testContext({
        currentUserId: adminUser.id,
      }),
    );

    tenantB = await prisma.tenant.findFirstOrThrow({
      where: { name: 'Tenant B' },
    });

    const { apiKey } = await apiKeyCreateController(
      {
        name: 'Admin Api Key',
        scopes: Object.values(permissions)
          .filter((permission) => permission.allowedRoles.includes(roles.admin))
          .map((permission) => permission.id),
        expiresAt: dayjs().add(1, 'day').toISOString(),
      },
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: tenantA?.id,
      }),
    );

    adminApiKeyBearer = apiKey;

    adminApiKey = await prisma.apiKey.findFirstOrThrow({
      where: { name: 'Admin Api Key' },
    });

    await authSignUpController(
      {
        email: 'other@scaffoldhub.io',
        password: '12345678',
      },
      await testContext(),
    );

    const apiKeyContext = await testContext({
      apiKey: adminApiKeyBearer,
    });

    await membershipCreateController(
      {
        email: 'other@scaffoldhub.io',
        roles: [roles.custom],
      },

      apiKeyContext,
    );

    await prisma.auditLog.create({
      data: {
        entityId: apiKeyContext.apiKey?.id || '',
        userId: apiKeyContext.currentUser?.id,
        tenantId: apiKeyContext.currentTenant?.id,
        membershipId: apiKeyContext.currentMembership?.id,
        apiKeyId: apiKeyContext.apiKey?.id,
        entityName: 'ApiKey',
        operation: auditLogOperations.apiPost,
        timestamp: new Date(),
        apiHttpResponseCode: '200',
        apiEndpoint: '/api/test',
      },
    });

    otherUser = await prisma.user.findFirstOrThrow({
      where: { email: 'other@scaffoldhub.io' },
      include: { memberships: true },
    });

    await membershipAcceptInvitationController(
      {
        token: otherUser?.memberships?.[0]?.invitationToken,
      },
      await testContext({
        currentUserId: otherUser.id,
        currentTenantId: tenantA.id,
      }),
    );
  });

  it('must be signed in', async () => {
    try {
      await auditLogFindManyController({}, await testContext());
      fail();
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it('must have access permissions', async () => {
    // no permission to see audit logs
    await prisma.membership.updateMany({
      data: { roles: [roles.custom] },
    });

    try {
      await auditLogFindManyController(
        {},
        await testContext({
          currentUserId: adminUser?.id,
          currentTenantId: tenantA?.id,
        }),
      );
      fail();
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it('show only from current tenant', async () => {
    const tenantAData = await auditLogFindManyController(
      {},
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: tenantA?.id,
      }),
    );

    expect(tenantAData.count).toEqual(7);
    expect(tenantAData.auditLogs.length).toEqual(7);
    expect(
      tenantAData.auditLogs.every(
        (auditLog: any) => auditLog.tenantId === tenantA?.id,
      ),
    ).toBeTruthy();

    const tenantBData = await auditLogFindManyController(
      {},
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: tenantB?.id,
      }),
    );

    expect(tenantBData.count).toEqual(1);
    expect(tenantBData.auditLogs.length).toEqual(1);
    expect(
      tenantBData.auditLogs.every(
        (auditLog: any) => auditLog.tenantId === tenantB?.id,
      ),
    ).toBeTruthy();
  });

  it('filter by entityNames', async () => {
    const data = await auditLogFindManyController(
      { filter: { entityNames: ['membership'] } },
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: tenantA?.id,
      }),
    );

    expect(data.count).toEqual(4);
    expect(data.auditLogs.length).toEqual(4);
    expect(
      data.auditLogs.every(
        (auditLog: any) => auditLog.entityName === 'Membership',
      ),
    ).toBeTruthy();
  });

  it('filter by apiKey', async () => {
    const data = await auditLogFindManyController(
      { filter: { apiKey: adminApiKey?.id } },
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: tenantA?.id,
      }),
    );

    expect(data.count).toEqual(2);
    expect(data.auditLogs.length).toEqual(2);
    expect(
      data.auditLogs.some(
        (auditLog: any) => auditLog.operation === auditLogOperations.apiPost,
      ),
    ).toBeTruthy();
    expect(
      data.auditLogs.some(
        (auditLog: any) => auditLog.operation === auditLogOperations.create,
      ),
    ).toBeTruthy();
  });

  it('filter by apiHttpResponseCode', async () => {
    const data = await auditLogFindManyController(
      { filter: { apiHttpResponseCode: '200' } },
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: tenantA?.id,
      }),
    );

    expect(data.count).toEqual(1);
    expect(data.auditLogs.length).toEqual(1);
    expect(data.auditLogs[0].apiHttpResponseCode).toBe('200');
  });

  it('filter by apiEndpoint', async () => {
    const data = await auditLogFindManyController(
      { filter: { apiEndpoint: 'test' } },
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: tenantA?.id,
      }),
    );

    expect(data.count).toEqual(1);
    expect(data.auditLogs.length).toEqual(1);
    expect(data.auditLogs[0].apiEndpoint).toBe('/api/test');
  });

  it('filter by operations', async () => {
    const data = await auditLogFindManyController(
      { filter: { operations: [auditLogOperations.apiPost] } },
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: tenantA?.id,
      }),
    );
    expect(data.count).toEqual(1);
    expect(data.auditLogs.length).toEqual(1);
    expect(data.auditLogs[0].apiHttpResponseCode).toBe('200');
  });

  it('filters by timestamp', async () => {
    const noData = await auditLogFindManyController(
      {
        filter: {
          timestampRange: [
            dayjs().subtract(1, 'day').toISOString(),
            dayjs().subtract(2, 'days').toISOString(),
          ],
        },
      },
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: tenantA?.id,
      }),
    );
    expect(noData.count).toEqual(0);

    const data = await auditLogFindManyController(
      {
        filter: {
          timestampRange: [
            dayjs().subtract(1, 'day').toISOString(),
            dayjs().add(1, 'days').toISOString(),
          ],
        },
      },
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: tenantA?.id,
      }),
    );

    expect(data.count).toEqual(7);
  });

  it('paginates', async () => {
    const data = await auditLogFindManyController(
      { take: 1 },
      await testContext({
        currentUserId: adminUser?.id,
        currentTenantId: tenantA?.id,
      }),
    );

    expect(data.count).toEqual(7);
    expect(data.auditLogs.length).toEqual(1);
  });
});
