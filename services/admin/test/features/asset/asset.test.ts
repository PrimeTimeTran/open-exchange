import { assetCreateController } from 'src/features/asset/controllers/assetCreateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';

describe('Asset Feature', () => {
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

  async function createAdminUserAndContext() {
    const user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
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

    return { context, tenant };
  }

  describe('Create Asset', () => {
    test('should create BTC asset', async () => {
      const { context, tenant } = await createAdminUserAndContext();

      const btcData = {
        symbol: 'BTC',
        type: 'crypto',
        precision: 8,
        isFractional: true,
        decimals: 8,
        meta: JSON.stringify({
          network: 'bitcoin',
        }),
      };

      const btc = await assetCreateController(btcData, context);

      expect(btc).toBeDefined();
      expect(btc.symbol).toBe('BTC');
      expect(btc.precision).toBe(8);
      expect(btc.decimals).toBe(8);
      expect(btc.isFractional).toBe(true);
      expect(btc.tenantId).toBe(tenant.id);
    });

    test('should create ETH asset', async () => {
      const { context } = await createAdminUserAndContext();

      const ethData = {
        symbol: 'ETH',
        type: 'crypto',
        precision: 18,
        isFractional: true,
        decimals: 18,
        meta: JSON.stringify({
          network: 'ethereum',
          contract: '0x0000000000000000000000000000000000000000',
        }),
      };

      const eth = await assetCreateController(ethData, context);

      expect(eth).toBeDefined();
      expect(eth.symbol).toBe('ETH');
      expect(eth.precision).toBe(18);
    });

    test('should create DOGE asset', async () => {
      const { context } = await createAdminUserAndContext();

      const dogeData = {
        symbol: 'DOGE',
        type: 'crypto',
        precision: 8,
        isFractional: true,
        decimals: 8,
        meta: JSON.stringify({
          wow: 'much coin',
        }),
      };

      const doge = await assetCreateController(dogeData, context);

      expect(doge).toBeDefined();
      expect(doge.symbol).toBe('DOGE');
    });

    test('should enforce unique symbol within tenant', async () => {
      const { context } = await createAdminUserAndContext();

      const data = {
        symbol: 'BTC',
        type: 'crypto',
      };

      await assetCreateController(data, context);

      // This part depends on how unique constraints are handled in the controller.
      // Usually, it throws a Prisma Client Known Request Error (P2002).
      await expect(assetCreateController(data, context)).rejects.toThrow();
    });
  });
});
