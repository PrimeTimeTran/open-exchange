import { Membership, Tenant, User } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { instrumentUpdateController } from 'src/features/instrument/controllers/instrumentUpdateController';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';

async function createInstrument(context: AppContext): Promise<any> {
  const prisma = prismaAuth(context);
  const currentTenant = await prisma.tenant.findFirstOrThrow();
  // TODO: Implement your own logic here
  // await prisma.instrument.create({});
}

describe('instrumentUpdate', () => {
  let currentUser: User;
  let currentTenant: Tenant;
  let currentMembership: Membership;
  const prisma = prismaDangerouslyBypassAuth();

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
    currentMembership = await prisma.membership.findFirstOrThrow();
  });

  it.skip('must be signed in', async () => {
    const instrument = await createInstrument(
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    try {
      await instrumentUpdateController(
        { id: instrument.id },
        {},
        await testContext(),
      );
      fail();
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error403);
    }
  });

  it.skip('must have permission', async () => {
    // remove permissions from user
    await prisma.membership.updateMany({
      data: {
        roles: [],
      },
    });

    const instrument = await createInstrument(
      await testContext({
        currentUserId: currentUser?.id,
        currentTenantId: currentTenant?.id,
      }),
    );

    try {
      await instrumentUpdateController(
        { id: instrument.id },
        {},
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

  // const updateTests = [
  //   {
  //     name: 'fieldName',
  //     valueFn: () => 'b'.repeat(5),
  //     expectedValueFn: () => 'b'.repeat(5),
  //   },
  // ];

  // updateTests.forEach((field) => {
  //   it(`updates ${field.name}`, async () => {
  //     const previousInstrument = await createInstrument(
  //       await testContext({
  //         currentUserId: currentUser?.id,
  //         currentTenantId: currentTenant?.id,
  //       }),
  //     );

  //     await instrumentUpdateController(
  //       { id: previousInstrument?.id },
  //       { [field.name]: await field.valueFn() },
  //       await testContext({
  //         currentUserId: currentUser?.id,
  //         currentTenantId: currentTenant?.id,
  //       }),
  //     );

  //     const updatedInstrument = await prisma.instrument.findUniqueOrThrow({
  //       where: { id: previousInstrument?.id },
  //       include: {},
  //     });

  //     expect({
  //       ...previousInstrument,
  //       [field.name]: await field.expectedValueFn(),
  //       updatedAt: null,
  //     }).toEqual({
  //       ...updatedInstrument,
  //       updatedAt: null,
  //     });
  //   });
  // });

  // const validationTests = [
  //   {
  //     name: 'TODO',
  //     invalidValue: null,
  //     evaluateResponseFn: (data: any) => {
  //       expect(data?.errors?.[0]).toHaveProperty('path', ['TODO']);
  //       expect(data?.errors?.[0]).toHaveProperty('code', 'invalid_type');
  //     },
  //   },
  // ];

  // validationTests.forEach((field) => {
  //   it(`${field.name}`, async () => {
  //     const previousInstrument = await createInstrument(
  //       await testContext({
  //         currentUserId: currentUser?.id,
  //         currentTenantId: currentTenant?.id,
  //       }),
  //     );

  //     try {
  //       await instrumentUpdateController(
  //         { id: previousInstrument?.id },
  //         {
  //           [field.name]: field.invalidValue,
  //         },
  //         await testContext({
  //           currentUserId: currentUser?.id,
  //           currentTenantId: currentTenant?.id,
  //         }),
  //       );
  //       fail();
  //     } catch (error: any) {
  //       field.evaluateResponseFn(error);
  //     }
  //   });
  // });
});
