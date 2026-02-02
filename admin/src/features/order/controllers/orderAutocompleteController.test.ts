import { Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { orderAutocompleteController } from 'src/features/order/controllers/orderAutocompleteController';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

async function createOrder(context: AppContext) {
  const prisma = prismaAuth(context);
  const currentTenant = await prisma.tenant.findFirstOrThrow();
  // TODO: Implement your own logic here
  // await prisma.order.create({});
}

describe('orderAutocomplete', () => {
  let currentUser: User;
  let currentTenant: Tenant;
  let prisma = prismaDangerouslyBypassAuth();

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

    await createOrder(
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );
  });

  describe('validation', () => {
    it('must be signed in', async () => {
      try {
        await orderAutocompleteController({}, await testContext());
        fail();
      } catch (error) {
        expect(error).toBeInstanceOf(Error403);
      }
    });
  });

  it.skip('filters', async () => {
    const search = 'SEARCH';
    const expectationCount = 0;

    const data = await orderAutocompleteController(
      { search },
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    expect(data.length).toEqual(expectationCount);

    // TODO: Implement your own logic here
  });
});
