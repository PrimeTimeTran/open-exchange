import { Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { chaterCreateController } from 'src/features/chater/controllers/chaterCreateController';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';

async function buildChater(context: AppContext) {
  const prisma = prismaAuth(context);
  const currentTenant = await prisma.tenant.findFirstOrThrow();
  // TODO: Implement your own logic here
  return {};
}

describe('chaterCreate', () => {
  let currentUser: User;
  let currentTenant: Tenant;
  let prisma = prismaDangerouslyBypassAuth();

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
    const body = await buildChater({
      currentTenant,
      currentUser,
      dictionary: dictionary,
      locale: 'en',
    });

    try {
      await chaterCreateController(body, await testContext());
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

    const body = await buildChater({
      currentTenant,
      currentUser,
      dictionary: dictionary,
      locale: 'en',
    });

    try {
      await chaterCreateController(
        body,
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

  it.skip('creates', async () => {
    const body = await buildChater(
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    await chaterCreateController(
      body,
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );
  });

  // const validationTests = [
  //   {
  //     name: 'TODO',
  //     invalidValue: undefined,
  //     evaluateResponseFn: (data: any) => {
  //       expect(data?.errors?.[0]).toHaveProperty('path', ['TODO']);
  //       expect(data?.errors?.[0]).toHaveProperty('code', 'invalid_type');
  //     },
  //   },
  // ];

  // validationTests.forEach((field: any) => {
  //   it(`${field.name}`, async () => {
  //     const body = {
  //       ...(await buildChater(
  //         await testContext({
  //           currentUserId: currentUser?.id,
  //           currentTenantId: currentTenant?.id,
  //         }),
  //       )),
  //       [field.name]: field.invalidValue,
  //     };

  //     try {
  //       await chaterCreateController(
  //         body,
  //         await testContext({
  //           currentUserId: currentUser?.id,
  //           currentTenantId: currentTenant?.id,
  //         }),
  //       );
  //       fail();
  //     } catch (error) {
  //       field.evaluateResponseFn(error);
  //     }
  //   });
  // });
});
