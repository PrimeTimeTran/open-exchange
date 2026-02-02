import { Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { membershipCreateController } from 'src/features/membership/controllers/membershipCreateController';
import { membershipDeclineInvitationController } from 'src/features/membership/controllers/membershipDeclineInvitationController';
import { roles } from 'src/features/roles';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';

const prisma = prismaDangerouslyBypassAuth();

const mockSendEmail = jest.fn();

jest.mock('src/shared/lib/sendEmail', () => {
  return {
    sendEmail: (...args: any) => mockSendEmail(...args),
  };
});

describe('membershipDeclineInvitation', () => {
  let currentUser: User;
  let currentTenant: Tenant;

  let invitedUser: User;
  let invitationToken: string;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_TENANT_MODE = 'multi';
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

    mockSendEmail.mockClear();

    await tenantCreateController(
      { name: 'ScaffoldHub' },
      await testContext({
        currentUserId: currentUser.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    currentTenant = await prisma.tenant.findFirstOrThrow();

    await membershipCreateController(
      { email: 'johndoe@scaffoldhub.io', roles: [roles.custom] },
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    invitedUser = await prisma.user.findUniqueOrThrow({
      where: { email: 'johndoe@scaffoldhub.io' },
    });

    invitationToken = (
      await prisma.membership.findFirst({
        where: {
          userId: invitedUser.id,
          tenantId: currentTenant.id,
        },
      })
    )?.invitationToken as string;
  });

  it('decline invitation', async () => {
    await membershipDeclineInvitationController(
      {
        token: invitationToken,
      },
      await testContext({
        currentUserId: invitedUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    const membershipCount = await prisma.membership.count({
      where: {
        userId: invitedUser.id,
        tenantId: currentTenant.id,
      },
    });

    expect(membershipCount).toBe(0);
  });

  it('require authentication', async () => {
    try {
      await membershipDeclineInvitationController(
        {
          token: invitationToken,
        },
        await testContext(),
      );
      fail();
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it('must be the same email the invite was sent to', async () => {
    const anotherUser = await prisma.user.create({
      data: {
        email: 'arthur@scaffoldhub.io',
      },
    });

    try {
      await membershipDeclineInvitationController(
        {
          token: invitationToken,
        },
        await testContext({
          currentUserId: anotherUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it('not found invitation', async () => {
    try {
      await membershipDeclineInvitationController(
        {
          token: 'invalid-token',
        },
        await testContext({
          currentUserId: invitedUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error: any) {
      expect(error.message).toEqual(dictionary.membership.errors.notInvited);
    }
  });
});
