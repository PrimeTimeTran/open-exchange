import { Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { listingFindManyController } from 'src/features/listing/controllers/listingFindManyController';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

async function createListingList(context: AppContext) {
  const prisma = prismaAuth(context);
  const currentTenant = await prisma.tenant.findFirstOrThrow();
  // TODO: Implement your own logic here
  // await prisma.listing.create({});
}

describe('listingFindMany', () => {
  let currentUser: User;
  let currentTenant: Tenant;
  const prisma = prismaDangerouslyBypassAuth();

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
    currentTenant = await prisma.tenant.findFirstOrThrow();

    const output = await createListingList(
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );
  });

  it('must be signed in', async () => {
    try {
      await listingFindManyController({}, await testContext());
      fail();
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it('must have permission', async () => {
    await prisma.membership.updateMany({
      where: { userId: currentUser?.id, tenantId: currentTenant?.id },
      data: {
        roles: [],
      },
    });

    try {
      await listingFindManyController(
        {},
        await testContext({
          currentUserId: currentUser?.id,
        }),
      );
      fail();
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error403);
    }
  });
});
