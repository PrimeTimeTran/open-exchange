import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import { matchingClient } from '@/services/MatchingClient';
import { orderCreateController } from 'src/features/order/controllers/orderCreateController';
import { orderEnumerators } from 'src/features/order/orderEnumerators';

describe('Order Feature', () => {
  let prisma;

  beforeAll(() => {
    prisma = prismaDangerouslyBypassAuth();
  });

  beforeEach(async () => {
    await testCleanDatabase();
    jest.clearAllMocks(); // Clear mocks between tests
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function createAdminUserAndContext() {
    const user = await prisma.user.create({
      data: {
        email: 'primetimetran@gmail.com',
        emailVerified: true,
      },
    });

    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Exchange',
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

    return { context, tenant, user };
  }

  describe('Create Order', () => {
    test('should create order in DB and send to matching engine', async () => {
      const { context, tenant, user } = await createAdminUserAndContext();

      // 1. Setup Mock for gRPC
      const placeOrderSpy = jest
        .spyOn(matchingClient, 'placeOrder')
        .mockResolvedValue({
          orderId: 'mock-order-id',
          success: true,
          errorMessage: '',
        });

      // 2. Create Order Data
      const orderData = {
        side: orderEnumerators.side.buy,
        type: orderEnumerators.type.limit,
        price: 50000,
        quantity: 1,
        status: orderEnumerators.status.open,
        timeInFore: orderEnumerators.timeInFore.gtc,
      };

      // 3. Call Controller
      const order = await orderCreateController(orderData, context);

      // 4. Assert DB Creation
      expect(order).toBeDefined();
      expect(order.side).toBe('buy');
      expect(order.price.toString()).toBe('50000');

      // 5. Assert Matching Engine Call
      expect(placeOrderSpy).toHaveBeenCalledTimes(1);

      // Verify the arguments passed to the gRPC client
      const calledArg = placeOrderSpy.mock.calls[0][0];
      expect(calledArg.order).toBeDefined();
      expect(calledArg.order?.side).toBeDefined(); // OrderSide enum check would go here if we imported enums
      expect(calledArg.order?.price).toBe('50000'); // Protobuf decimal is string
      expect(calledArg.order?.quantity).toBe('1');
      expect(calledArg.order?.tenantId).toBe(tenant.id);
    });
  });
});
