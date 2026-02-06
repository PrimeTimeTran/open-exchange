import { User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { roles } from 'src/features/roles';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

const prisma = prismaDangerouslyBypassAuth();

describe('tenantCreate', () => {
  let currentUser: User;

  beforeEach(async () => {
    await authSignUpController(
      {
        email: 'felipe@scaffoldhub.io',
        password: '12345678',
      },
      await testContext(),
    );

    currentUser = await prisma.user.findFirstOrThrow();
  });

  describe('validation', () => {
    beforeAll(() => {
      process.env.NEXT_PUBLIC_TENANT_MODE = 'multi';
    });

    it('name is a required field', async () => {
      try {
        await tenantCreateController(
          {},
          await testContext({
            currentUserId: currentUser?.id,
          }),
        );
        fail();
      } catch (error: any) {
        expect(error.errors[0].path).toEqual(['name']);
        expect(error.errors[0].code).toEqual('invalid_type');
      }
    });

    it('must be signed in', async () => {
      try {
        await tenantCreateController(
          { name: 'ScaffoldHub' },
          await testContext(),
        );
        fail();
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error403);
      }
    });
  });

  describe('single tenant', () => {
    beforeAll(() => {
      process.env.NEXT_PUBLIC_TENANT_MODE = 'single';
    });

    it('returns 403 error', async () => {
      try {
        await tenantCreateController(
          { name: 'ScaffoldHub' },
          await testContext({
            currentUserId: currentUser?.id,
          }),
        );
        fail();
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error403);
      }
    });
  });

  describe('multi tenant', () => {
    beforeAll(() => {
      process.env.NEXT_PUBLIC_TENANT_MODE = 'multi';
    });

    beforeEach(async () => {
      await tenantCreateController(
        { name: 'ScaffoldHub' },
        await testContext({
          currentUserId: currentUser?.id,
        }),
      );
    });

    it('creates the tenant', async () => {
      const tenant = await prisma.tenant.findFirst();
      expect(tenant?.name).toBe('ScaffoldHub');
    });

    it('makes creator the admin', async () => {
      const tenant = await prisma.tenant.findFirst({
        include: {
          memberships: true,
        },
      });

      expect(tenant?.memberships?.length).toBe(1);
      expect(tenant?.memberships?.[0].roles).toEqual([roles.admin]);
    });
  });
});
