import { Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { MembershipStatus } from 'src/features/membership/MembershipStatus';
import { membershipAcceptInvitationController } from 'src/features/membership/controllers/membershipAcceptInvitationController';
import { membershipCreateController } from 'src/features/membership/controllers/membershipCreateController';
import { roles } from 'src/features/roles';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
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

describe('membershipAcceptInvitation', () => {
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

  it('accepts invitation', async () => {
    await membershipAcceptInvitationController(
      { token: invitationToken },
      await testContext({
        currentUserId: invitedUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    const membership = await prisma.membership.findFirst({
      where: {
        userId: invitedUser.id,
        tenantId: currentTenant.id,
      },
    });

    expect(MembershipStatus.isActive(membership)).toBe(true);
    expect(membership?.roles).toEqual([roles.custom]);
  });

  it('join roles if already a member', async () => {
    await membershipAcceptInvitationController(
      { token: invitationToken, forceAcceptOtherEmail: true },
      await testContext({
        currentUserId: currentUser?.id, // currentUser is already a admin
        currentTenantId: currentTenant?.id,
      }),
    );

    let reloadedMembership = await prisma.membership.findFirst({
      where: {
        userId: currentUser.id,
        tenantId: currentTenant.id,
      },
    });

    expect(MembershipStatus.isActive(reloadedMembership)).toBe(true);
    expect(reloadedMembership?.roles).toEqual([roles.custom, roles.admin]);
  });

  it('prompt if using a different email than invited', async () => {
    const anotherEmailUser = await prisma.user.create({
      data: {
        email: 'arthur@scaffoldhub.io',
      },
    });

    try {
      await membershipAcceptInvitationController(
        { token: invitationToken },
        await testContext({
          currentUserId: anotherEmailUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error: any) {
      expect(error.message).toEqual(
        formatTranslation(
          dictionary.membership.errors.notSameEmail,
          'johndoe@scaffoldhub.io',
          'arthur@scaffoldhub.io',
        ),
      );
    }
  });

  it('force accept with different email if flag is set', async () => {
    const anotherEmailUser = await prisma.user.create({
      data: {
        email: 'arthur@scaffoldhub.io',
      },
    });

    await membershipAcceptInvitationController(
      { token: invitationToken, forceAcceptOtherEmail: true },
      await testContext({
        currentUserId: anotherEmailUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    const membership = await prisma.membership.findFirst({
      where: {
        userId: anotherEmailUser.id,
        tenantId: currentTenant.id,
      },
    });

    expect(MembershipStatus.isActive(membership)).toBe(true);
    expect(membership?.roles).toEqual([roles.custom]);
  });
});
