import { Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { ledgerEntryAutocompleteController } from 'src/features/ledgerEntry/controllers/ledgerEntryAutocompleteController';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

async function createLedgerEntry(context: AppContext) {
  const prisma = prismaAuth(context);
  const currentTenant = await prisma.tenant.findFirstOrThrow();
  // TODO: Implement your own logic here
  // await prisma.ledgerEntry.create({});
}

describe('ledgerEntryAutocomplete', () => {
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

    await createLedgerEntry(
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );
  });

  describe('validation', () => {
    it('must be signed in', async () => {
      try {
        await ledgerEntryAutocompleteController({}, await testContext());
        fail();
      } catch (error) {
        expect(error).toBeInstanceOf(Error403);
      }
    });
  });

  it.skip('filters', async () => {
    const search = 'SEARCH';
    const expectationCount = 0;

    const data = await ledgerEntryAutocompleteController(
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
