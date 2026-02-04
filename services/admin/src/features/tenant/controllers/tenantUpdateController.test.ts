import { Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { roles } from 'src/features/roles';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { tenantUpdateController } from 'src/features/tenant/controllers/tenantUpdateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

const prisma = prismaDangerouslyBypassAuth();

describe('tenantUpdate', () => {
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
  });

  describe('validation', () => {
    it('must be signed in', async () => {
      try {
        await tenantUpdateController(
          {
            id: currentTenant.id,
          },
          { name: 'ScaffoldHub' },
          await testContext(),
        );
        fail();
      } catch (error) {
        expect(error).toBeInstanceOf(Error403);
      }
    });

    it('must have access to the tenant', async () => {
      await prisma.membership.deleteMany({
        where: { userId: currentUser?.id },
      });

      try {
        await tenantUpdateController(
          {
            id: currentTenant.id,
          },
          { name: 'ScaffoldHub' },
          await testContext({
            currentUserId: currentUser?.id,
          }),
        );
        fail();
      } catch (error) {
        expect(error).toBeInstanceOf(Error403);
      }
    });

    it('must have role access to the tenant', async () => {
      await prisma.membership.updateMany({
        where: { userId: currentUser?.id, tenantId: currentTenant?.id },
        data: {
          // this role has no access to update
          roles: [roles.custom],
        },
      });

      try {
        await tenantUpdateController(
          {
            id: currentTenant.id,
          },
          { name: 'ScaffoldHub' },
          await testContext({
            currentUserId: currentUser?.id,
          }),
        );
        fail();
      } catch (error) {
        expect(error).toBeInstanceOf(Error403);
      }
    });
  });

  it('keep old name if not sent', async () => {
    try {
      await tenantUpdateController(
        {
          id: currentTenant.id,
        },
        {},
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: currentTenant.id },
    });
    expect(tenant?.name).toBe('ScaffoldHub');
  });

  it('updates the tenant', async () => {
    await tenantUpdateController(
      {
        id: currentTenant.id,
      },
      {
        name: 'ScaffoldHub Updated',
        ignoredField: 'ignored',
      },
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    const tenant = await prisma.tenant.findUnique({
      where: { id: currentTenant.id },
    });
    expect(tenant?.name).toBe('ScaffoldHub Updated');
  });
});
