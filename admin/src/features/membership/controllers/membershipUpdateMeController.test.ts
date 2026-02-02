import { Membership, Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { membershipUpdateMeController } from 'src/features/membership/controllers/membershipUpdateMeController';
import { roles } from 'src/features/roles';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';
import { testMockFilesArray } from 'src/shared/test/testMockFilesArray';

const prisma = prismaDangerouslyBypassAuth();

const mockSendEmail = jest.fn();

jest.mock('src/shared/lib/sendEmail', () => {
  return {
    sendEmail: (...args: any) => mockSendEmail(...args),
  };
});

interface UserWithMemberships extends User {
  memberships: Membership[];
}

describe('membershipUpdateMe', () => {
  let currentUser: UserWithMemberships | null;
  let currentTenant: Tenant;
  let currentMembership: Membership | null;

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

    currentUser = await prisma.user.findFirst({
      include: { memberships: true },
    });

    currentTenant = await prisma.tenant.findFirstOrThrow();

    await prisma.membership.updateMany({
      where: { userId: currentUser?.id, tenantId: currentTenant?.id },
      data: {
        // Just to validate that the current user can have any kind of access
        roles: [roles.custom],
      },
    });

    currentUser = await prisma.user.findFirst({
      include: { memberships: true },
    });

    currentMembership = currentUser?.memberships[0] || null;
  });

  describe('validation', () => {
    it('must be signed in', async () => {
      try {
        await membershipUpdateMeController(
          { firstName: 'John' },
          await testContext(),
        );
        fail();
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error403);
      }
    });
  });

  describe('success', () => {
    beforeEach(async () => {
      await membershipUpdateMeController(
        {
          firstName: 'John',
          lastName: 'Doe',
          avatars: testMockFilesArray(1),
          // This field will be ignored
          roles: [roles.admin],
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      currentMembership = await prisma.membership.findFirst({});
    });

    it('updates first name', async () => {
      expect(currentMembership?.firstName).toBe('John');
    });

    it('updates last name', async () => {
      expect(currentMembership?.lastName).toBe('Doe');
    });

    it('updates avatars', async () => {
      expect(currentMembership?.avatars).toEqual(testMockFilesArray(1));
    });

    it('DO NOT updates roles', async () => {
      const originalRoles = [roles.custom];
      expect(currentMembership?.roles).toEqual(originalRoles);
    });
  });
});
