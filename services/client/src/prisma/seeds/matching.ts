import { PrismaClient, Prisma } from '@prisma/client';
import { ensureWallet } from './seedUtils';

async function matchSingleOrder(
  prisma: PrismaClient,
  tenantId: string,
  instrument: any,
  sellerOrder: any,
  buyerOrder: any,
  matchPrice: number,
  matchQuantity: number,
  fees: { buyerFee?: number; sellerFee?: number } = {},
) {
  const feeAccount = await prisma.account.findFirst({
    where: { tenantId, type: 'fees' },
  });

  await prisma.$transaction(async (tx) => {
    // Calculate fee values
    const quoteDec = instrument.quoteAsset.decimals;
    const quoteFactor = new Prisma.Decimal(10).pow(quoteDec);

    const buyerFeeVal = fees.buyerFee
      ? new Prisma.Decimal(fees.buyerFee).mul(quoteFactor).floor()
      : new Prisma.Decimal(0);
    const sellerFeeVal = fees.sellerFee
      ? new Prisma.Decimal(fees.sellerFee).mul(quoteFactor).floor()
      : new Prisma.Decimal(0);

    // Create a trade
    const trade = await tx.trade.create({
      data: {
        tenantId,
        price: matchPrice,
        quantity: matchQuantity,
        instrumentId: instrument.id,
        createdByUserId: sellerOrder.createdByUserId, // attributing to seller for now
        updatedByUserId: sellerOrder.createdByUserId,
        createdByMembershipId: null,
        updatedByMembershipId: null,
      },
    });

    // Create fills
    await tx.fill.create({
      data: {
        tenantId,
        side: 'buy',
        price: matchPrice,
        quantity: matchQuantity,
        fee: buyerFeeVal,
        role: 'taker',
        feeCurrency: instrument.quoteAsset.symbol,
        instrumentId: instrument.id,
        orderId: buyerOrder.id,
        tradeId: trade.id,
        createdByUserId: buyerOrder.createdByUserId,
        updatedByUserId: buyerOrder.createdByUserId,
        createdByMembershipId: buyerOrder.createdByMembershipId,
        updatedByMembershipId: buyerOrder.createdByMembershipId,
      },
    });

    await tx.fill.create({
      data: {
        tenantId,
        side: 'sell',
        price: matchPrice,
        quantity: matchQuantity,
        fee: sellerFeeVal,
        role: 'maker',
        feeCurrency: instrument.quoteAsset.symbol,
        instrumentId: instrument.id,
        orderId: sellerOrder.id,
        tradeId: trade.id,
        createdByUserId: sellerOrder.createdByUserId,
        updatedByUserId: sellerOrder.createdByUserId,
        createdByMembershipId: sellerOrder.createdByMembershipId,
        updatedByMembershipId: sellerOrder.createdByMembershipId,
      },
    });

    // Update orders' quantityFilled and status
    const updateOrderFilled = async (order: any, addQty: number) => {
      // Use atomic increment to handle concurrent updates or stale objects
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          quantityFilled: { increment: addQty },
          updatedByUserId: order.createdByUserId,
          updatedByMembershipId: order.createdByMembershipId,
        },
      });

      const filled = updatedOrder.quantityFilled || new Prisma.Decimal(0);
      const total = updatedOrder.quantity || new Prisma.Decimal(0);

      const status = filled.greaterThanOrEqualTo(total)
        ? 'filled'
        : 'partial_fill';

      if (updatedOrder.status !== status) {
        await tx.order.update({
          where: { id: order.id },
          data: { status },
        });
      }
    };

    await updateOrderFilled(buyerOrder, matchQuantity);
    await updateOrderFilled(sellerOrder, matchQuantity);

    // Adjust wallets
    const baseDec = instrument.underlyingAsset.decimals;
    const baseFactor = new Prisma.Decimal(10).pow(baseDec);

    const baseAmount = new Prisma.Decimal(matchQuantity).mul(baseFactor);
    const quoteAmount = new Prisma.Decimal(matchPrice)
      .mul(new Prisma.Decimal(matchQuantity))
      .mul(quoteFactor)
      .floor();

    // Buyer: increment Base available, decrement Quote locked (and deduct fee if any?)
    // Usually buyer fee is deducted from the received base asset (if fee is in base) or charged extra in quote (if fee is in quote).
    // The previous logic assumed feeCurrency='USD' (Quote).
    // If buyer pays fee in USD, it should be deducted from their locked USD? Or added to the cost?
    // In the original massive block, buyer fee was 0.
    // If we support buyer fee in USD, we should probably deduct it from the wallet if it wasn't locked, or assume it was locked.
    // Let's assume for now buyer fee is 0 as per previous code, but if it were set:
    // If fee is USD (quote), and we decrement locked USD by quoteAmount, we also need to pay the fee.

    // For simplicity matching the original logic (seller pays fee from proceeds):
    // Buyer:
    await tx.wallet.updateMany({
      where: {
        tenantId: tenantId,
        accountId: buyerOrder.accountId,
        assetId: instrument.underlyingAssetId,
      },
      data: {
        available: { increment: baseAmount },
        total: { increment: baseAmount },
      },
    });

    // Determine how much to unlock for Buyer
    // Locked Amount was based on ORDER PRICE, not Match Price.
    // We must release (MatchQty * OrderPrice).
    // Total balance decreases by (MatchQty * MatchPrice) [Cost].
    // Difference returns to Available.
    const buyLockAmount = new Prisma.Decimal(buyerOrder.price)
      .mul(new Prisma.Decimal(matchQuantity))
      .mul(quoteFactor)
      .floor();

    await tx.wallet.updateMany({
      where: {
        tenantId: tenantId,
        accountId: buyerOrder.accountId,
        assetId: instrument.quoteAssetId,
      },
      data: {
        locked: { decrement: buyLockAmount },
        total: { decrement: quoteAmount },
        available: { increment: buyLockAmount.sub(quoteAmount) },
      },
    });

    // Seller: decrement Base locked, increment Quote available (minus fee)
    await tx.wallet.updateMany({
      where: {
        tenantId: tenantId,
        accountId: sellerOrder.accountId,
        assetId: instrument.underlyingAssetId,
      },
      data: {
        locked: { decrement: baseAmount },
        total: { decrement: baseAmount },
      },
    });

    const sellerProceeds = quoteAmount.sub(sellerFeeVal);

    await tx.wallet.updateMany({
      where: {
        tenantId: tenantId,
        accountId: sellerOrder.accountId,
        assetId: instrument.quoteAssetId,
      },
      data: {
        available: { increment: sellerProceeds },
        total: { increment: sellerProceeds },
      },
    });

    // Credit Fee Account
    if (feeAccount && (buyerFeeVal.gt(0) || sellerFeeVal.gt(0))) {
      const totalFee = buyerFeeVal.add(sellerFeeVal);
      await ensureWallet(
        tx as any,
        tenantId,
        feeAccount.createdByMembershipId!,
        feeAccount.createdByUserId!,
        feeAccount.id,
        instrument.quoteAssetId,
        totalFee,
        { increment: true },
      );

      // Ledger entry for fees?
      // The original code created a separate ledger entry for the fee.
    }

    // Ledger Entries
    const ledgerEvent = await tx.ledgerEvent.create({
      data: {
        tenantId,
        type: 'trade',
        status: 'completed',
        referenceType: 'Trade',
        referenceId: trade.id,
        createdByUserId: sellerOrder.createdByUserId,
        updatedByUserId: sellerOrder.createdByUserId,
        createdByMembershipId: null,
        updatedByMembershipId: null,
      },
    });

    // Buyer Entries
    await tx.ledgerEntry.createMany({
      data: [
        {
          tenantId,
          eventId: ledgerEvent.id,
          accountId: buyerOrder.accountId,
          meta: { assetId: instrument.quoteAssetId },
          amount: new Prisma.Decimal(quoteAmount).negated(), // Assuming no buyer fee for now
          createdByUserId: buyerOrder.createdByUserId,
          updatedByUserId: buyerOrder.createdByUserId,
          createdByMembershipId: buyerOrder.createdByMembershipId,
          updatedByMembershipId: buyerOrder.createdByMembershipId,
        },
        {
          tenantId,
          eventId: ledgerEvent.id,
          accountId: buyerOrder.accountId,
          meta: { assetId: instrument.underlyingAssetId },
          amount: new Prisma.Decimal(baseAmount),
          createdByUserId: buyerOrder.createdByUserId,
          updatedByUserId: buyerOrder.createdByUserId,
          createdByMembershipId: buyerOrder.createdByMembershipId,
          updatedByMembershipId: buyerOrder.createdByMembershipId,
        },
      ],
    });

    // Seller Entries
    await tx.ledgerEntry.createMany({
      data: [
        {
          tenantId,
          eventId: ledgerEvent.id,
          accountId: sellerOrder.accountId,
          meta: { assetId: instrument.underlyingAssetId },
          amount: new Prisma.Decimal(baseAmount).negated(),
          createdByUserId: sellerOrder.createdByUserId,
          updatedByUserId: sellerOrder.createdByUserId,
          createdByMembershipId: sellerOrder.createdByMembershipId,
          updatedByMembershipId: sellerOrder.createdByMembershipId,
        },
        {
          tenantId,
          eventId: ledgerEvent.id,
          accountId: sellerOrder.accountId,
          meta: { assetId: instrument.quoteAssetId },
          amount: sellerProceeds,
          createdByUserId: sellerOrder.createdByUserId,
          updatedByUserId: sellerOrder.createdByUserId,
          createdByMembershipId: sellerOrder.createdByMembershipId,
          updatedByMembershipId: sellerOrder.createdByMembershipId,
        },
      ],
    });

    // Fee Ledger Entry
    if (feeAccount && (buyerFeeVal.gt(0) || sellerFeeVal.gt(0))) {
      const totalFee = buyerFeeVal.add(sellerFeeVal);
      await tx.ledgerEntry.create({
        data: {
          tenantId,
          eventId: ledgerEvent.id,
          accountId: feeAccount.id,
          meta: { assetId: instrument.quoteAssetId },
          amount: totalFee,
          createdByUserId: null,
          updatedByUserId: null,
          createdByMembershipId: null,
          updatedByMembershipId: null,
        },
      });
    }
  });
}

export async function seedMatchedTrades(
  prisma: PrismaClient,
  tenantId: string,
  btcInstrument: any,
  ethInstrument?: any,
) {
  if (!btcInstrument) {
    console.log('BTC Instrument not found, skipping matched trades seeding.');
    return;
  }

  try {
    const superUser = await prisma.user.findUnique({
      where: { email: 'primetimetran@gmail.com' },
    });

    if (superUser) {
      // Find the seller's BTC sell order (price 100_000, qty 10)
      const sellerOrder = await prisma.order.findFirst({
        where: {
          createdByUserId: superUser.id,
          instrumentId: btcInstrument.id,
          side: 'sell',
          price: 100_000,
        },
      });

      if (sellerOrder) {
        // Find two buyers we seeded
        const buyer1 = await prisma.user.findUnique({
          where: { email: 'primetimetran1@gmail.com' },
        });
        const buyer2 = await prisma.user.findUnique({
          where: { email: 'primetimetran2@gmail.com' },
        });

        const buyer1Order = buyer1
          ? await prisma.order.findFirst({
              where: {
                createdByUserId: buyer1.id,
                instrumentId: btcInstrument.id,
                side: 'buy',
                price: 100_000,
              },
            })
          : null;

        const buyer2Order = buyer2
          ? await prisma.order.findFirst({
              where: {
                createdByUserId: buyer2.id,
                instrumentId: btcInstrument.id,
                side: 'buy',
                price: 100_000,
              },
            })
          : null;

        if (buyer1Order && buyer2Order) {
          // Match first buyer (5 BTC)
          console.log('Matching BTC 100k - Buyer 1 (5 BTC)...');
          await matchSingleOrder(
            prisma,
            tenantId,
            btcInstrument,
            sellerOrder,
            buyer1Order,
            100_000,
            5,
            { sellerFee: 50 }, // 50% of 100 fee
          );

          // Match second buyer (5 BTC)
          console.log('Matching BTC 100k - Buyer 2 (5 BTC)...');
          await matchSingleOrder(
            prisma,
            tenantId,
            btcInstrument,
            sellerOrder,
            buyer2Order,
            100_000,
            5,
            { sellerFee: 50 }, // 50% of 100 fee
          );
        }
      }
    }

    // New Logic for BTC 150k Match (1 BTC)
    // Seller: SuperUser (150k, 10 BTC)
    // Buyer: Buyer1 (150k, 1 BTC)
    {
      const buyer1 = await prisma.user.findUnique({
        where: { email: 'primetimetran1@gmail.com' },
      });

      if (buyer1 && superUser) {
        const sellerOrder150k = await prisma.order.findFirst({
          where: {
            createdByUserId: superUser.id,
            instrumentId: btcInstrument.id,
            side: 'sell',
            price: 150_000,
            status: { in: ['open', 'partial_fill'] },
          },
        });
        const buyerOrder150k = await prisma.order.findFirst({
          where: {
            createdByUserId: buyer1.id,
            instrumentId: btcInstrument.id,
            side: 'buy',
            price: 150_000,
            status: 'open',
          },
        });

        if (sellerOrder150k && buyerOrder150k) {
          console.log('Matching BTC 150k order...');
          await matchSingleOrder(
            prisma,
            tenantId,
            btcInstrument,
            sellerOrder150k,
            buyerOrder150k,
            150_000,
            1,
            { sellerFee: 15 }, // 0.01% fee (150k * 0.0001)
          );
        }
      }
    }

    // New Logic for ETH 10k Match (5 ETH)
    // Seller: SuperUser (10k, 10 ETH)
    // Buyer: Buyer2 (10k, 5 ETH)
    if (ethInstrument) {
      const buyer2 = await prisma.user.findUnique({
        where: { email: 'primetimetran2@gmail.com' },
      });

      if (buyer2 && superUser) {
        const sellerOrderEth = await prisma.order.findFirst({
          where: {
            createdByUserId: superUser.id,
            instrumentId: ethInstrument.id,
            side: 'sell',
            price: 10_000,
            status: { in: ['open', 'partial_fill'] },
          },
        });
        const buyerOrderEth = await prisma.order.findFirst({
          where: {
            createdByUserId: buyer2.id,
            instrumentId: ethInstrument.id,
            side: 'buy',
            price: 10_000,
            status: 'open',
          },
        });

        if (sellerOrderEth && buyerOrderEth) {
          console.log('Matching ETH 10k order...');
          await matchSingleOrder(
            prisma,
            tenantId,
            ethInstrument,
            sellerOrderEth,
            buyerOrderEth,
            10_000,
            5,
          );
        }
      }
    }
  } catch (err) {
    console.error('Error creating matched fills:', err);
  }
}
