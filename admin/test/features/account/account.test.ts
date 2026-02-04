import { accountCreateController } from 'src/features/account/controllers/accountCreateController';
import { accountEnumerators } from 'src/features/account/accountEnumerators';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';

describe('Account', () => {
  let prisma;

  beforeAll(() => {
    prisma = prismaDangerouslyBypassAuth();
  });

  beforeEach(async () => {
    await testCleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should create a new account', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'primetimetran@gmail.com',
        emailVerified: true,
      },
    });

    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Tenant',
        memberships: {
          create: {
            userId: user.id,
            status: 'active',
            roles: ['admin'],
          },
        },
      },
    });

    const context = await testContext({
      currentUserId: user.id,
      currentTenantId: tenant.id,
    });

    const body = {
      type: accountEnumerators.type.cash,
      status: accountEnumerators.status.active,
    };

    const createdAccount = await accountCreateController(body, context);

    expect(createdAccount).toBeDefined();
    expect(createdAccount.id).toBeDefined();
    expect(createdAccount.type).toBe(body.type);
    expect(createdAccount.status).toBe(body.status);
    expect(createdAccount.tenantId).toBe(tenant.id);
  });
});
