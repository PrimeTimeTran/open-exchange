import { User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { tenantFindController } from 'src/features/tenant/controllers/tenantFindController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { testContext } from 'src/shared/test/testContext';
import { v4 as uuid } from 'uuid';

const prisma = prismaDangerouslyBypassAuth();

describe('tenantFind', () => {
  let currentUser: User;

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
  });

  it('find', async () => {
    const tenant = await prisma.tenant.findFirst();

    const tenantFromResponse = await tenantFindController(
      {
        id: tenant?.id,
      },
      await testContext({
        currentUserId: currentUser?.id,
      }),
    );

    expect(tenantFromResponse).toEqual(tenant);
  });

  it('not found', async () => {
    try {
      await tenantFindController(
        {
          id: uuid(),
        },
        await testContext({
          currentUserId: currentUser?.id,
        }),
      );
      fail();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
