import { Tenant, User } from '@prisma/client';
import dayjs from 'dayjs';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { tenantFindManyController } from 'src/features/tenant/controllers/tenantFindManyController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

const prisma = prismaDangerouslyBypassAuth();

describe('tenantFindMany', () => {
  let currentUser: User;
  let currentTenant: Tenant;

  beforeEach(async () => {
    process.env.NEXT_PUBLIC_TENANT_MODE = 'multi';

    await authSignUpController(
      {
        email: 'felipe@scaffoldhub.io',
        password: '12345678',
      },
      await testContext(),
    );

    currentUser = await prisma.user.findFirstOrThrow();

    await tenantCreateController(
      {
        name: 'ScaffoldHub',
      },
      await testContext({
        currentUserId: currentUser.id,
      }),
    );

    currentTenant = await prisma.tenant.findFirstOrThrow({
      where: { name: 'ScaffoldHub' },
    });

    await tenantCreateController(
      {
        name: 'Lima Acme',
      },
      await testContext({
        currentUserId: currentUser.id,
      }),
    );

    await tenantCreateController(
      {
        name: 'Excluded',
      },
      await testContext({
        currentUserId: currentUser.id,
      }),
    );

    await prisma.membership.deleteMany({
      where: {
        userId: currentUser.id,
        tenant: {
          name: 'Excluded',
        },
      },
    });
  });

  describe('validation', () => {
    it('must be signed in', async () => {
      try {
        await tenantFindManyController({}, await testContext());
        fail();
      } catch (error) {
        expect(error).toBeInstanceOf(Error403);
      }
    });

    it('must have access to the tenant', async () => {
      await prisma.membership.deleteMany({
        where: { userId: currentUser?.id },
      });

      const data = await tenantFindManyController(
        { filter: { name: 'Excluded' } },
        await testContext({
          currentUserId: currentUser?.id,
        }),
      );

      expect(data).toEqual({ count: 0, tenants: [] });
    });
  });

  describe('success', () => {
    it('filters by name', async () => {
      const data = await tenantFindManyController(
        { filter: { name: 'Lima Acme' } },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(1);
      expect(data.tenants.length).toEqual(1);
      expect(data.tenants[0].name).toEqual('Lima Acme');
    });

    it('filters by createdAt', async () => {
      let data = await tenantFindManyController(
        {
          filter: {
            createdAtRange: [
              dayjs().subtract(1, 'day').toISOString(),
              dayjs().subtract(2, 'days').toISOString(),
            ],
          },
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(0);

      data = await tenantFindManyController(
        {
          filter: {
            createdAtRange: [
              dayjs().subtract(1, 'day').toISOString(),
              dayjs().add(1, 'days').toISOString(),
            ],
          },
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(2);
    });

    it('paginates', async () => {
      let data = await tenantFindManyController(
        { take: 1 },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(2);
      expect(data.tenants.length).toEqual(1);
    });

    it('sorts', async () => {
      let data = await tenantFindManyController(
        {
          take: 1,
          orderBy: {
            name: 'asc',
          },
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(2);
      expect(data.tenants[0].name).toEqual('Lima Acme');

      data = await tenantFindManyController(
        {
          take: 1,
          orderBy: {
            name: 'desc',
          },
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      expect(data.count).toEqual(2);
      expect(data.tenants[0].name).toEqual('ScaffoldHub');
    });
  });
});
