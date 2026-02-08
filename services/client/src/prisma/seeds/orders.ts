import { PrismaClient } from '@prisma/client';

export async function seedOrders(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
) {
  console.log('Seeding Orders & Fills (Comprehensive)...');

  const instruments = await prisma.instrument.findMany({
    where: {
      symbol: { in: ['BTC_USD', 'ETH_USD', 'AAPL_USD'] },
    },
  });

  const btc = instruments.find((i) => i.symbol === 'BTC_USD');
  const eth = instruments.find((i) => i.symbol === 'ETH_USD');
  const aapl = instruments.find((i) => i.symbol === 'AAPL_USD');

  const mainAccount = await prisma.account.findFirst({
    where: { userId: membershipId },
  });

  if (!mainAccount) {
    console.log('Main account not found, skipping orders.');
    return;
  }

  const commonData = {
    tenantId,
    accountId: mainAccount.id,
    timeInFore: 'gtc',
    createdByMembershipId: membershipId,
    updatedByMembershipId: membershipId,
    createdByUserId: userId,
    updatedByUserId: userId,
  };

  // Helper to create order
  const createOrder = async (
    instId: string,
    side: string,
    type: string,
    status: string,
    price: number,
    qty: number,
    filled: number = 0,
  ) => {
    return prisma.order.create({
      data: {
        ...commonData,
        instrumentId: instId,
        side,
        type,
        status,
        price,
        quantity: qty,
        quantityFilled: filled,
        createdAt: new Date(),
      },
    });
  };

  // BTC Orders
  if (btc) {
    console.log('Seeding BTC orders...');
    // Open Bids (Buy Limit) - Order Book Depth
    await createOrder(btc.id, 'buy', 'limit', 'open', 64500, 0.5);
    await createOrder(btc.id, 'buy', 'limit', 'open', 64200, 1.2);
    await createOrder(btc.id, 'buy', 'limit', 'open', 64000, 2.0);

    // Open Asks (Sell Limit) - Order Book Depth
    await createOrder(btc.id, 'sell', 'limit', 'open', 65500, 0.3);
    await createOrder(btc.id, 'sell', 'limit', 'open', 65800, 0.8);
    await createOrder(btc.id, 'sell', 'limit', 'open', 66000, 1.5);

    // Filled Orders (History)
    const filledOrder = await prisma.order.create({
      data: {
        ...commonData,
        instrumentId: btc.id,
        side: 'buy',
        type: 'limit',
        status: 'filled',
        price: 60000,
        quantity: 0.1,
        quantityFilled: 0.1,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    });

    await prisma.trade.create({
      data: {
        tenantId,
        instrumentId: btc.id,
        price: 60000,
        quantity: 0.1,
        buyOrderId: { connect: { id: filledOrder.id } },
        createdAt: new Date(Date.now() - 86400000),
        createdByMembershipId: membershipId,
        updatedByMembershipId: membershipId,
        createdByUserId: userId,
        updatedByUserId: userId,
        fills: {
          create: {
            tenantId,
            side: 'buy',
            price: 60000,
            quantity: 0.1,
            fee: 5.0,
            createdByMembershipId: membershipId,
            updatedByMembershipId: membershipId,
            createdByUserId: userId,
            updatedByUserId: userId,
          },
        },
      },
    });
  }

  // ETH Orders
  if (eth) {
    console.log('Seeding ETH orders...');
    // Open Bids
    await createOrder(eth.id, 'buy', 'limit', 'open', 3450, 10);
    await createOrder(eth.id, 'buy', 'limit', 'open', 3400, 25);

    // Open Asks
    await createOrder(eth.id, 'sell', 'limit', 'open', 3550, 5);
    await createOrder(eth.id, 'sell', 'limit', 'open', 3600, 15);
  }

  // AAPL Orders
  if (aapl) {
    console.log('Seeding AAPL orders...');
    // Open Bids
    await createOrder(aapl.id, 'buy', 'limit', 'open', 215.5, 100);
    await createOrder(aapl.id, 'buy', 'limit', 'open', 215.0, 500);
    await createOrder(aapl.id, 'buy', 'limit', 'open', 214.25, 200);

    // Open Asks
    await createOrder(aapl.id, 'sell', 'limit', 'open', 216.5, 150);
    await createOrder(aapl.id, 'sell', 'limit', 'open', 217.0, 300);
    await createOrder(aapl.id, 'sell', 'limit', 'open', 218.0, 1000);

    // Cancelled Order
    await prisma.order.create({
      data: {
        ...commonData,
        instrumentId: aapl.id,
        side: 'sell',
        type: 'limit',
        status: 'cancelled',
        price: 220.0,
        quantity: 50,
        quantityFilled: 0,
        createdAt: new Date(Date.now() - 3600000),
      },
    });
  }

  console.log('Orders seeded.');
}
