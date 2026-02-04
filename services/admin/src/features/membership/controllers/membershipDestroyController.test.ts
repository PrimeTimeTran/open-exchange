import { Membership, Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { membershipDestroyManyController } from 'src/features/membership/controllers/membershipDestroyManyController';
import { roles } from 'src/features/roles';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';

const mockSendEmail = jest.fn();

jest.mock('src/shared/lib/sendEmail', () => {
  return {
    sendEmail: (...args: any) => mockSendEmail(...args),
  };
});

const mockSubscriptionCancelOnStripe = jest.fn();

jest.mock('src/features/subscription/subscriptionCancelOnStripe', () => {
  return {
    subscriptionCancelOnStripe: (...args: any) =>
      mockSubscriptionCancelOnStripe(...args),
  };
});

interface UserWithMemberships extends User {
  memberships: Membership[];
}

describe('membership destroy', () => {
  let prisma = prismaDangerouslyBypassAuth();

  let currentUser: UserWithMemberships | null;
  let currentTenant: Tenant;
  let currentMembership: Membership | null;

  let firstMembership: Membership | null;
  let secondMembership: Membership | null;

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

    currentMembership = currentUser?.memberships[0] || null;

    currentTenant = await prisma.tenant.findFirstOrThrow();

    prisma = prismaDangerouslyBypassAuth({
      currentUser,
      currentMembership,
      currentTenant,
    });

    const firstUser = await prisma.user.create({
      data: {
        email: 'johndoe@scaffoldhub.io',
      },
    });

    firstMembership = await prisma.membership.create({
      data: {
        tenantId: String(currentTenant?.id),
        roles: [roles.custom],
        userId: firstUser?.id,
      },
    });

    const secondUser = await prisma.user.create({
      data: {
        email: 'johndoe2@scaffoldhub.io',
      },
    });

    secondMembership = await prisma.membership.create({
      data: {
        tenantId: String(currentTenant?.id),
        roles: [roles.custom],
        userId: secondUser?.id,
      },
    });
  });

  describe('validation', () => {
    it('must be signed in', async () => {
      try {
        await membershipDestroyManyController(
          {
            ids: [firstMembership?.id],
          },
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
        await membershipDestroyManyController(
          {
            ids: [firstMembership?.id],
          },
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

    it('dont allow deleting yourself', async () => {
      try {
        await membershipDestroyManyController(
          {
            ids: [currentMembership?.id],
          },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );
        fail();
      } catch (error: any) {
        expect(error.message).toEqual(
          dictionary.membership.errors.cannotDeleteSelf,
        );
      }
    });
  });

  describe('success', () => {
    beforeEach(async () => {
      await membershipDestroyManyController(
        {
          ids: [firstMembership?.id, secondMembership?.id],
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
    });

    it('delete both memberships', async () => {
      const membershipCount = await prisma.membership.count({});
      // The current user is the only one left
      expect(membershipCount).toBe(1);
    });
  });
});
