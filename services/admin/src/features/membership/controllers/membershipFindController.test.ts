import { Membership, Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { membershipFindController } from 'src/features/membership/controllers/membershipFindController';
import { roles } from 'src/features/roles';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

describe('membershipFind', () => {
  let prisma = prismaDangerouslyBypassAuth();
  let currentUser: User;
  let currentTenant: Tenant;

  let invitedMembership: Membership | null;

  beforeEach(async () => {
    process.env.NEXT_PUBLIC_TENANT_MODE = 'single';

    await authSignUpController(
      {
        email: 'felipe@scaffoldhub.io',
        password: '12345678',
      },
      await testContext(),
    );

    currentUser = await prisma.user.findFirstOrThrow();
    let currentMembership = await prisma.membership.findFirstOrThrow();
    currentTenant = await prisma.tenant.findFirstOrThrow();
    prisma = prismaDangerouslyBypassAuth({
      currentUser,
      currentMembership,
      currentTenant,
    });

    await prisma.membership.updateMany({
      data: {
        firstName: 'Felipe',
        lastName: 'Lima',
      },
    });

    await prisma.user.create({
      data: {
        email: 'arthur@scaffoldhub.io',
        memberships: {
          create: {
            tenantId: String(currentTenant?.id),
            firstName: 'Arthur',
            lastName: 'Doe',
            invitationToken: 'INVITED',
            roles: [roles.custom],
          },
        },
      },
    });

    invitedMembership = await prisma.membership.findFirst({
      where: { firstName: 'Arthur' },
    });
  });

  describe('validation', () => {
    it('must be signed in', async () => {
      try {
        await membershipFindController({}, await testContext());
        fail();
      } catch (error) {
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
        await membershipFindController(
          { id: invitedMembership?.id },
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

  describe('success', () => {
    it('finds and hide invitation token', async () => {
      const data = await membershipFindController(
        { id: invitedMembership?.id },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(data?.invitationToken).toBeFalsy();
      expect(data?.firstName).toEqual('Arthur');
    });
  });
});
