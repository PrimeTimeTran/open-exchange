import { Referral, Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { referralDestroyManyController } from 'src/features/referral/controllers/referralDestroyManyController';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';
import { v4 as uuid } from 'uuid';

async function createReferral(context: AppContext): Promise<any> {
  const prisma = prismaAuth(context);
  const currentTenant = await prisma.tenant.findFirstOrThrow();
  // TODO: Implement your own logic here
  // await prisma.referral.create({});
}

describe('referralDestroy', () => {
  const prisma = prismaDangerouslyBypassAuth();
  let currentUser: User;
  let currentTenant: Tenant;
  let referral: Referral;

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

    referral = await createReferral(
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );
  });

  it('must be signed in', async () => {
    try {
      await referralDestroyManyController(
        {
          ids: [referral?.id],
        },
        await testContext(),
      );
      fail();
    } catch (error) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it('must have permission', async () => {
    // remove permissions from user
    await prisma.membership.updateMany({
      data: {
        roles: [],
      },
    });

    try {
      await referralDestroyManyController(
        {
          ids: [referral?.id],
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it.skip('deletes', async () => {
    const countBeforeDelete = await prisma.referral.count();

    await referralDestroyManyController(
      {
        ids: [referral?.id],
      },
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    const countAfterDelete = await prisma.referral.count();
    expect(countBeforeDelete - countAfterDelete).toEqual(1);
  });

  it('not found', async () => {
    const countBeforeDelete = await prisma.referral.count();

    await referralDestroyManyController(
      {
        ids: [uuid()],
      },
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    const countAfterDelete = await prisma.referral.count();
    expect(countBeforeDelete - countAfterDelete).toEqual(0);
  });
});
