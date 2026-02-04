import { Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { membershipCreateController } from 'src/features/membership/controllers/membershipCreateController';
import { roles } from 'src/features/roles';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';
import { formatTranslation } from 'src/translation/formatTranslation';

const prisma = prismaDangerouslyBypassAuth();

const mockSendEmail = jest.fn();

jest.mock('src/shared/lib/sendEmail', () => {
  return {
    sendEmail: (...args: any) => mockSendEmail(...args),
  };
});

describe('membershipCreate', () => {
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

  describe('validation', () => {
    it('email is a required field', async () => {
      try {
        await membershipCreateController(
          { roles: [roles.admin] },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );
        fail();
      } catch (error: any) {
        expect(error.errors[0].path).toEqual(['email']);
        expect(error.errors[0].code).toEqual('invalid_type');
      }
    });

    it('is already a member', async () => {
      try {
        await membershipCreateController(
          { email: 'felipe@scaffoldhub.io', roles: [roles.admin] },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );
        fail();
      } catch (error: any) {
        expect(error.message).toEqual(
          formatTranslation(
            dictionary.membership.errors.alreadyMember,
            'felipe@scaffoldhub.io',
          ),
        );
      }
    });

    it('must be signed in', async () => {
      try {
        await membershipCreateController(
          { email: 'johndoe@scaffoldhub.io', roles: [roles.admin] },
          await testContext(),
        );
        fail();
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error403);
      }
    });

    it('must have permission', async () => {
      await prisma.membership.updateMany({
        where: { userId: currentUser?.id, tenantId: currentTenant?.id },
        data: {
          // this role has no access
          roles: [roles.custom],
        },
      });

      try {
        await membershipCreateController(
          { email: 'johndoe@scaffoldhub.io', roles: [roles.admin] },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );
        fail();
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error403);
      }
    });
  });

  describe('success', () => {
    beforeEach(async () => {
      mockSendEmail.mockClear();

      await membershipCreateController(
        { email: 'johndoe@scaffoldhub.io', roles: [roles.admin] },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
    });

    it('invite and transform email in lowercase', async () => {
      const user = await prisma.user.findFirst({
        where: { email: 'johndoe@scaffoldhub.io' },
      });

      expect(user).toBeTruthy();
    });

    it('sends invitation email with token', async () => {
      expect(mockSendEmail).toHaveBeenCalled();
    });
  });
});
