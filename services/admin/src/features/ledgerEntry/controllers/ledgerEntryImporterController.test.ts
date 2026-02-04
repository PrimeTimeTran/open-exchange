import { Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { ledgerEntryImporterController } from 'src/features/ledgerEntry/controllers/ledgerEntryImporterController';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';

async function buildLedgerEntry(context: AppContext) {
  const prisma = prismaAuth(context);
  const currentTenant = await prisma.tenant.findFirstOrThrow();

  // TODO: Implement your own logic here
  return {};
}

describe('ledgerEntryImport', () => {
  const prisma = prismaDangerouslyBypassAuth();
  let currentUser: User;
  let currentTenant: Tenant;

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
  });

  it('must be signed in', async () => {
    const body = await buildLedgerEntry(
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    try {
      await ledgerEntryImporterController(body, await testContext());
      fail();
    } catch (error: any) {
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

    const body = await buildLedgerEntry(
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    try {
      await ledgerEntryImporterController(
        body,
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

  it.skip('imports', async () => {
    const body = await buildLedgerEntry(
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    const response = await ledgerEntryImporterController(
      { _line: 1, ...body, importHash: '1' },
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    expect(response[0]._status).toBe('success');
  });

  it.skip('importHash is a required field', async () => {
    const body = await buildLedgerEntry({
      currentTenant,
      currentUser,
      dictionary: dictionary,
      locale: 'en',
    });

    const response = await ledgerEntryImporterController(
      { _line: 1, ...body },
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    expect(response[0]._status).toBe('error');
    expect(response[0]._line).toBe(1);
    expect(response[0]._errorMessages?.[0]).toContain('importHash');
  });

  it.skip('validate unique import hash', async () => {
    const body = await buildLedgerEntry({
      currentTenant,
      currentUser,
      dictionary: dictionary,
      locale: 'en',
    });

    await ledgerEntryImporterController(
      { _line: 1, ...body, importHash: '1' },
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    const response = await ledgerEntryImporterController(
      { _line: 2, ...body, importHash: '1' },
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    expect(response[0]._status).toBe('error');
    expect(response[0]._line).toBe(2);
    expect(response[0]._errorMessages).toEqual([
      dictionary.shared.importer.importHashAlreadyExists,
    ]);
  });
});
