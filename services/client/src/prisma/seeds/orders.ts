import { PrismaClient } from '@prisma/client';

export async function seedOrders(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
) {
  console.log('Seeding Orders & Fills...');
  const btcUsd = await prisma.instrument.findFirst({
    where: { symbol: 'BTC_USD' },
  });
  const ethUsd = await prisma.instrument.findFirst({
    where: { symbol: 'ETH_USD' },
  });
  const mainAccount = await prisma.account.findFirst({
    where: { userId: membershipId },
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
        createdByMembershipId: membershipId,
        updatedByMembershipId: membershipId,
        createdByUserId: userId,
        updatedByUserId: userId,
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
        createdByMembershipId: membershipId,
        updatedByMembershipId: membershipId,
        createdByUserId: userId,
        updatedByUserId: userId,
        fills: {
          create: {
            tenantId,
            side: 'buy',
            price: 42000,
            quantity: 0.5,
            fee: 10.5, // Mock fee
            createdByMembershipId: membershipId,
            updatedByMembershipId: membershipId,
            createdByUserId: userId,
            updatedByUserId: userId,
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
        createdByMembershipId: membershipId,
        updatedByMembershipId: membershipId,
        createdByUserId: userId,
        updatedByUserId: userId,
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
        createdByMembershipId: membershipId,
        updatedByMembershipId: membershipId,
        createdByUserId: userId,
        updatedByUserId: userId,
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
        createdByMembershipId: membershipId,
        updatedByMembershipId: membershipId,
        createdByUserId: userId,
        updatedByUserId: userId,
        fills: {
          create: {
            tenantId,
            side: 'buy',
            price: 2200,
            quantity: 5,
            fee: 2.2,
            createdByMembershipId: membershipId,
            updatedByMembershipId: membershipId,
            createdByUserId: userId,
            updatedByUserId: userId,
          },
        },
      },
    });
  }
}
