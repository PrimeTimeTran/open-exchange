import { User } from '@prisma/client';
import { authMeController } from 'src/features/auth/controllers/authMeController';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { MembershipStatus } from 'src/features/membership/MembershipStatus';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

describe('membershipCreate', () => {
  const prisma = prismaDangerouslyBypassAuth();
  let currentUser: User;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_TENANT_MODE = 'single';
  });

  beforeEach(async () => {
    await authSignUpController(
      {
        email: 'admin@scaffoldhub.io',
        password: '12345678',
      },
      await testContext(),
    );
    currentUser = await prisma.user.findFirstOrThrow();
  });

  it('return user with memberships and tenants', async () => {
    const currentUserFromResponse = await authMeController(
      await testContext({
        currentUserId: currentUser?.id,
      }),
    );

    expect(currentUserFromResponse.id).toEqual(currentUser.id);
    expect(currentUserFromResponse.email).toEqual(currentUser.email);
    expect(currentUserFromResponse.memberships?.length).toEqual(1);
    expect(
      MembershipStatus.of(currentUserFromResponse.memberships?.[0]),
    ).toEqual('active');
    expect(currentUserFromResponse.memberships?.[0]?.tenant?.name).toEqual(
      'default',
    );
  });

  it('returns only if authenticated', async () => {
    try {
      await authMeController(await testContext());
      fail();
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(Error403);
    }
  });
});
