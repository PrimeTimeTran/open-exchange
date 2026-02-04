import { Membership, Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { membershipAcceptInvitationController } from 'src/features/membership/controllers/membershipAcceptInvitationController';
import { membershipCreateController } from 'src/features/membership/controllers/membershipCreateController';
import { membershipResendInvitationEmailController } from 'src/features/membership/controllers/membershipResentInvitationEmailController';
import { roles } from 'src/features/roles';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import Error404 from 'src/shared/errors/Error404';
import { testContext } from 'src/shared/test/testContext';

const prisma = prismaDangerouslyBypassAuth();

const mockSendEmail = jest.fn();

jest.mock('src/shared/lib/sendEmail', () => {
  return {
    sendEmail: (...args: any) => mockSendEmail(...args),
  };
});

describe('membershipResentInvitationEmail', () => {
  let currentUser: User;
  let currentTenant: Tenant;
  let membership: Membership;
  let invitedUser: User;

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

    membership = await prisma.membership.findFirstOrThrow({
      where: {
        userId: invitedUser.id,
        tenantId: currentTenant.id,
      },
    });
  });

  it('resends invitation email', async () => {
    mockSendEmail.mockClear();

    await membershipResendInvitationEmailController(
      {
        id: membership?.id,
      },
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    expect(mockSendEmail).toHaveBeenCalled();
  });

  it('returns 404 if invitation is already accepted', async () => {
    await membershipAcceptInvitationController(
      {
        token: membership?.invitationToken,
      },
      await testContext({
        currentUserId: invitedUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    try {
      await membershipResendInvitationEmailController(
        {
          id: membership?.id,
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error404);
    }

    expect(mockSendEmail).toHaveBeenCalled();
  });

  it('must be signed in', async () => {
    try {
      await membershipResendInvitationEmailController(
        {
          id: membership?.id,
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
      await membershipResendInvitationEmailController(
        {
          id: membership?.id,
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
});
