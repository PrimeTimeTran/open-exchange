import { Membership, Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { membershipUpdateController } from 'src/features/membership/controllers/membershipUpdateController';
import { roles } from 'src/features/roles';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';
import { testMockFilesArray } from 'src/shared/test/testMockFilesArray';
import dictionary from 'src/translation/en/en';

const mockSendEmail = jest.fn();

jest.mock('src/shared/lib/sendEmail', () => {
  return {
    sendEmail: (...args: any) => mockSendEmail(...args),
  };
});

interface UserWithMemberships extends User {
  memberships: Membership[];
}

describe('membershipUpdate', () => {
  let currentUser: UserWithMemberships;
  let currentTenant: Tenant;
  let currentMembership: Membership;
  let prisma = prismaDangerouslyBypassAuth();

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

    currentUser = await prisma.user.findFirstOrThrow({
      include: { memberships: true },
    });

    currentMembership = currentUser?.memberships[0] || null;

    currentTenant = await prisma.tenant.findFirstOrThrow();

    prisma = prismaDangerouslyBypassAuth({
      currentUser,
      currentMembership,
      currentTenant,
    });
  });

  describe('validation', () => {
    it('must be signed in', async () => {
      try {
        await membershipUpdateController(
          { id: currentMembership?.id },
          { roles: [roles.admin] },
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
        await membershipUpdateController(
          { id: currentMembership?.id },
          { roles: [roles.admin] },
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

    it('dont allow removing yourself as admin', async () => {
      try {
        await membershipUpdateController(
          { id: currentMembership?.id },
          {
            firstName: 'John',
            lastName: 'Doe',
            avatars: testMockFilesArray(1),
            roles: [roles.custom],
          },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );
        fail();
      } catch (error: any) {
        expect(error.message).toBe(
          dictionary.membership.errors.cannotRemoveSelfAdminRole,
        );
      }
    });
  });

  describe('success', () => {
    let updatedMembership: Membership | null;

    beforeEach(async () => {
      const _prismaAuth = prismaDangerouslyBypassAuth({
        currentUser,
        currentMembership,
        currentTenant,
      });
      const updatedUser = await _prismaAuth.user.create({
        data: {
          email: 'johndoe@scaffoldhub.io',
        },
      });

      updatedMembership = await _prismaAuth.membership.create({
        data: {
          tenantId: currentTenant?.id,
          roles: [roles.custom],
          userId: updatedUser?.id,
        },
      });

      await membershipUpdateController(
        { id: updatedMembership?.id },
        {
          firstName: 'John',
          lastName: 'Doe',
          avatars: testMockFilesArray(1),
          roles: [roles.custom],
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      updatedMembership = await prisma.membership.findUnique({
        where: { id: updatedMembership?.id },
      });
    });

    it('updates first name', async () => {
      expect(updatedMembership?.firstName).toBe('John');
    });

    it('updates last name', async () => {
      expect(updatedMembership?.lastName).toBe('Doe');
    });

    it('updates avatars', async () => {
      expect(updatedMembership?.avatars).toEqual(testMockFilesArray(1));
    });

    it('updates roles', async () => {
      expect(updatedMembership?.roles).toEqual([roles.custom]);
    });
  });
});
