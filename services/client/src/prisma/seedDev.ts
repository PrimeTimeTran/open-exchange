import 'dotenv/config';
import 'tsconfig-paths/register';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding development data...');

  // 1. Ensure Tenant (Assuming single tenant mode or just picking the first one/creating one)
  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.log('Creating default tenant...');
    tenant = await prisma.tenant.create({
      data: {
        name: 'Default Tenant',
        createdByUserId: null,
        updatedByUserId: null,
      },
    });
  }
  const tenantId = tenant.id;
  console.log(`Using tenant: ${tenantId}`);

  // 2. Ensure User (admin)
  // This might be created by prismaCreateAppUser, but let's check.
  const email = 'primetimetran@gmail.com';
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`Creating user ${email}...`);
    // Note: Password hashing is usually handled in the app, but for seed we might need a bypass or simple hash if we want to login.
    // For now, let's assume we just need the user record for relationships.
    user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash('Asdf!123', 10),
        emailVerified: true,
      },
    });
  }

  // Ensure Membership
  let membership = await prisma.membership.findFirst({
    where: {
      userId: user.id,
      tenantId: tenantId,
    },
  });

  if (!membership) {
    console.log('Creating membership...');
    membership = await prisma.membership.create({
      data: {
        userId: user.id,
        tenantId: tenantId,
        roles: ['admin'],
        status: 'active',
        firstName: 'Loi',
        lastName: 'Tran',
        fullName: 'Loi Tran',
        createdByUserId: user.id,
        updatedByUserId: user.id,
        createdByMembershipId: null,
        updatedByMembershipId: null,
      },
    });
  }

  // Set context for RLS-like behavior if needed, or just use prisma directly as we are superadmin here.
  // Many of our create calls in the app use context, but raw prisma calls don't automatically set postgres variables.
  // We can pass tenantId explicitly where needed.

  // 3. Create Assets
  const assetsData = [
    { symbol: 'USD', name: 'US Dollar', type: 'fiat', decimals: 2 },
    { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', decimals: 8 },
    { symbol: 'ETH', name: 'Ethereum', type: 'crypto', decimals: 18 },
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', decimals: 2 },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'etf', decimals: 2 },
  ];

  const assetsMap = new Map();

  for (const assetData of assetsData) {
    const existing = await prisma.asset.findFirst({
      where: {
        tenantId,
        symbol: assetData.symbol,
      },
    });

    if (existing) {
      console.log(`Asset ${assetData.symbol} already exists.`);
      assetsMap.set(assetData.symbol, existing);
    } else {
      console.log(`Creating asset ${assetData.symbol}...`);
      const created = await prisma.asset.create({
        data: {
          tenantId,
          symbol: assetData.symbol,
          type: assetData.type,
          decimals: assetData.decimals,
          // meta: { name: assetData.name },
          createdByMembershipId: membership.id,
          updatedByMembershipId: membership.id,
          createdByUserId: user.id,
          updatedByUserId: user.id,
        },
      });
      assetsMap.set(assetData.symbol, created);
    }
  }

  // 4. Create Instruments
  const instrumentsData = [
    { symbol: 'BTC_USD', base: 'BTC', quote: 'USD', type: 'spot' },
    { symbol: 'ETH_USD', base: 'ETH', quote: 'USD', type: 'spot' },
    { symbol: 'AAPL_USD', base: 'AAPL', quote: 'USD', type: 'spot' },
    {
      symbol: 'AAPL_25JUN21_150_C',
      base: 'AAPL',
      quote: 'USD',
      type: 'option',
      meta: { expiry: '2029-06-21', strike: 150, optionType: 'call' },
    },
    {
      symbol: 'BTC_25JUN26',
      base: 'BTC',
      quote: 'USD',
      type: 'future',
      meta: { expiry: '2029-06-26' },
    },
  ];

  for (const instData of instrumentsData) {
    const existing = await prisma.instrument.findFirst({
      where: {
        tenantId,
        symbol: instData.symbol,
      },
    });

    if (existing) {
      console.log(`Instrument ${instData.symbol} already exists.`);
    } else {
      const baseAsset = assetsMap.get(instData.base);
      const quoteAsset = assetsMap.get(instData.quote);

      if (baseAsset && quoteAsset) {
        console.log(`Creating instrument ${instData.symbol}...`);
        await prisma.instrument.create({
          data: {
            tenantId,
            symbol: instData.symbol,
            underlyingAssetId: baseAsset.id,
            quoteAssetId: quoteAsset.id,
            status: 'active',
            type: instData.type,
            meta: instData.meta,
            createdByMembershipId: membership.id,
            updatedByMembershipId: membership.id,
            createdByUserId: user.id,
            updatedByUserId: user.id,
          },
        });
      }
    }
  }

  // 5. Create Wallets (Balances)
  // Give the admin user some money
  const balances = [
    { asset: 'USD', amount: 1000000 },
    { asset: 'BTC', amount: 10 },
    { asset: 'ETH', amount: 100 },
    { asset: 'AAPL', amount: 500 },
  ];

  for (const balance of balances) {
    const asset = assetsMap.get(balance.asset);
    if (asset) {
      const wallet = await prisma.wallet.findFirst({
        where: {
          tenantId,
          assetId: asset.id,
          userId: membership.id, // Assuming wallet is linked to user directly or via membership? Schema says walletTenant, walletCreatedBy... wait.
          // Let's check schema for Wallet relations.
          // Wallet usually belongs to a User or Account.
          // Checking schema: Wallet has `user User?`, `account Account?`
        },
      });

      // Let's create an Account first if needed, but Wallet has direct User relation in many schemas.
      // Checking schema again...
      // model Wallet { ... user User? ... account Account? ... }

      // We will link to User for simplicity if allowed, or create an Account.
      // Let's create a default "Main" account for the user.
      let account = await prisma.account.findFirst({
        where: {
          tenantId,
          userId: membership.id,
        },
      });

      if (!account) {
        console.log('Creating Main account for user...');
        account = await prisma.account.create({
          data: {
            tenantId,
            userId: membership.id,
            type: 'custody',
            status: 'active',
            createdByMembershipId: membership.id,
            updatedByMembershipId: membership.id,
            createdByUserId: user.id,
            updatedByUserId: user.id,
          },
        });
      }

      const existingWallet = await prisma.wallet.findFirst({
        where: {
          tenantId,
          accountId: account.id,
          assetId: asset.id,
        },
      });

      if (!existingWallet) {
        console.log(
          `Creating wallet for ${balance.asset} with ${balance.amount}...`,
        );
        await prisma.wallet.create({
          data: {
            tenantId,
            userId: membership.id,
            accountId: account.id,
            assetId: asset.id,
            available: balance.amount,
            total: balance.amount,
            locked: 0,
            version: 1,
            createdByMembershipId: membership.id,
            updatedByMembershipId: membership.id,
            createdByUserId: user.id,
            updatedByUserId: user.id,
          },
        });
      } else {
        console.log(`Wallet for ${balance.asset} already exists.`);
      }
    }
  }

  // 6. Create Seed Orders & Fills
  console.log('Seeding Orders & Fills...');
  const btcUsd = await prisma.instrument.findFirst({
    where: { symbol: 'BTC_USD' },
  });
  const ethUsd = await prisma.instrument.findFirst({
    where: { symbol: 'ETH_USD' },
  });
  const mainAccount = await prisma.account.findFirst({
    where: { userId: membership.id },
  });

  if (btcUsd && mainAccount) {
    // Create some past orders
    const order1 = await prisma.order.create({
      data: {
        tenantId,
        instrumentId: btcUsd.id,
        accountId: mainAccount.id,
        side: 'buy',
        type: 'limit',
        status: 'filled',
        price: 42000,
        quantity: 0.5,
        quantityFilled: 0.5,
        timeInFore: 'gtc',
        createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
        createdByMembershipId: membership.id,
        updatedByMembershipId: membership.id,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      },
    });

    await prisma.trade.create({
      data: {
        tenantId,
        instrumentId: btcUsd.id,
        price: 42000,
        quantity: 0.5,
        buyOrderId: { connect: { id: order1.id } },
        // In a real match, sellOrder would exist too, but for seeding we can skip or create a system sell order
        createdAt: new Date(Date.now() - 86400000 * 2),
        createdByMembershipId: membership.id,
        updatedByMembershipId: membership.id,
        createdByUserId: user.id,
        updatedByUserId: user.id,
        fills: {
          create: {
            tenantId,
            side: 'buy',
            price: 42000,
            quantity: 0.5,
            fee: 10.5, // Mock fee
            createdByMembershipId: membership.id,
            updatedByMembershipId: membership.id,
            createdByUserId: user.id,
            updatedByUserId: user.id,
          },
        },
      },
    });

    // Create an open order
    await prisma.order.create({
      data: {
        tenantId,
        instrumentId: btcUsd.id,
        accountId: mainAccount.id,
        side: 'sell',
        type: 'limit',
        status: 'open',
        price: 45000,
        quantity: 0.1,
        quantityFilled: 0,
        timeInFore: 'gtc',
        createdAt: new Date(),
        createdByMembershipId: membership.id,
        updatedByMembershipId: membership.id,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      },
    });
  }

  if (ethUsd && mainAccount) {
    // Create a filled ETH buy
    const ethOrder = await prisma.order.create({
      data: {
        tenantId,
        instrumentId: ethUsd.id,
        accountId: mainAccount.id,
        side: 'buy',
        type: 'market',
        status: 'filled',
        price: 2200, // Avg fill price
        quantity: 5,
        quantityFilled: 5,
        timeInFore: 'ioc',
        createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
        createdByMembershipId: membership.id,
        updatedByMembershipId: membership.id,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      },
    });

    await prisma.trade.create({
      data: {
        tenantId,
        instrumentId: ethUsd.id,
        price: 2200,
        quantity: 5,
        buyOrderId: { connect: { id: ethOrder.id } },
        createdAt: new Date(Date.now() - 86400000 * 5),
        createdByMembershipId: membership.id,
        updatedByMembershipId: membership.id,
        createdByUserId: user.id,
        updatedByUserId: user.id,
        fills: {
          create: {
            tenantId,
            side: 'buy',
            price: 2200,
            quantity: 5,
            fee: 2.2,
            createdByMembershipId: membership.id,
            updatedByMembershipId: membership.id,
            createdByUserId: user.id,
            updatedByUserId: user.id,
          },
        },
      },
    });
  }

  console.log('Seeding completed.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
