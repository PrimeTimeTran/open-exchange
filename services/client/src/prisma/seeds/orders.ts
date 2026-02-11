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
    include: {
      underlyingAsset: true,
      quoteAsset: true,
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
    const inst = instruments.find((i) => i.id === instId);
    let finalPrice = price;
    let finalQty = qty;
    let finalFilled = filled;

    if (inst && inst.underlyingAsset && inst.quoteAsset) {
      const baseDec = inst.underlyingAsset.decimals;
      const quoteDec = inst.quoteAsset.decimals;

      // Price Atomic = Price Major * 10^(Q-B)
      const priceScale = Math.pow(10, quoteDec - baseDec);
      finalPrice = price * priceScale;

      // Qty Atomic = Qty Major * 10^B
      const qtyScale = Math.pow(10, baseDec);
      finalQty = qty * qtyScale;
      finalFilled = filled * qtyScale;
    }

    return prisma.order.create({
      data: {
        ...commonData,
        instrumentId: instId,
        side,
        type,
        status,
        price: finalPrice,
        quantity: finalQty,
        quantityFilled: finalFilled,
        createdAt: new Date(),
      },
    });
  };

  // BTC Orders
  if (btc && btc.underlyingAsset && btc.quoteAsset) {
    console.log('Seeding BTC orders...');
    const btcBase = btc.underlyingAsset.decimals;
    const btcQuote = btc.quoteAsset.decimals;
    const btcPScale = Math.pow(10, btcQuote - btcBase);
    const btcQScale = Math.pow(10, btcBase);

    // Open Bids (Buy Limit) - Order Book Depth
    await createOrder(btc.id, 'buy', 'limit', 'open', 64500, 0.5);
    await createOrder(btc.id, 'buy', 'limit', 'open', 64200, 1.2);
    await createOrder(btc.id, 'buy', 'limit', 'open', 64000, 2.0);

    // Open Asks (Sell Limit) - Order Book Depth
    await createOrder(btc.id, 'sell', 'limit', 'open', 65500, 0.3);
    await createOrder(btc.id, 'sell', 'limit', 'open', 65800, 0.8);
    await createOrder(btc.id, 'sell', 'limit', 'open', 66000, 1.5);

    // AI Requested Orders
    console.log('Seeding requested AI orders...');

    // 3. Limit Bid Order for 10 BTC at $50,000 (Filled)
    // To simulate a "filled" order in history, we create it as 'filled' and add a trade record.
    const filledBid = await createOrder(
      btc.id,
      'buy',
      'limit',
      'filled',
      50000,
      10,
      10,
    );

    await prisma.trade.create({
      data: {
        tenantId,
        instrumentId: btc.id,
        price: 50000 * btcPScale,
        quantity: 10 * btcQScale,
        buyOrderId: { connect: { id: filledBid.id } },
        // Ideally we'd connect a sell order too, but for history we can leave it nullable or create a dummy counterparty order.
        // For simplicity, just recording the trade associated with this user's order.
        createdAt: new Date(),
        createdByMembershipId: membershipId,
        updatedByMembershipId: membershipId,
        createdByUserId: userId,
        updatedByUserId: userId,
        fills: {
          create: {
            tenantId,
            side: 'buy',
            price: 50000 * btcPScale,
            quantity: 10 * btcQScale,
            fee: 0,
            createdByMembershipId: membershipId,
            updatedByMembershipId: membershipId,
            createdByUserId: userId,
            updatedByUserId: userId,
          },
        },
      },
    });

    // 4. Sell Order of 10 BTC at $100,000 (Open)
    await createOrder(btc.id, 'sell', 'limit', 'open', 100000, 10);

    // Filled Orders (History)
    const filledOrder = await prisma.order.create({
      data: {
        ...commonData,
        instrumentId: btc.id,
        side: 'buy',
        type: 'limit',
        status: 'filled',
        price: 60000 * btcPScale,
        quantity: 0.1 * btcQScale,
        quantityFilled: 0.1 * btcQScale,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    });

    await prisma.trade.create({
      data: {
        tenantId,
        instrumentId: btc.id,
        price: 60000 * btcPScale,
        quantity: 0.1 * btcQScale,
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
            price: 60000 * btcPScale,
            quantity: 0.1 * btcQScale,
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
  if (aapl && aapl.underlyingAsset && aapl.quoteAsset) {
    console.log('Seeding AAPL orders...');
    const aaplBase = aapl.underlyingAsset.decimals;
    const aaplQuote = aapl.quoteAsset.decimals;
    const aaplPScale = Math.pow(10, aaplQuote - aaplBase);
    const aaplQScale = Math.pow(10, aaplBase);

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
        price: 220.0 * aaplPScale,
        quantity: 50 * aaplQScale,
        quantityFilled: 0,
        createdAt: new Date(Date.now() - 3600000),
      },
    });
  }

  console.log('Orders seeded.');
}
