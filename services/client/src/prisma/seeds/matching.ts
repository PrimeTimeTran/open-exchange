import { PrismaClient, Prisma } from '@prisma/client';

export async function seedMatchedTrades(
  prisma: PrismaClient,
  tenantId: string,
  btcInstrument: any,
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
          const feeAccount = await prisma.account.findFirst({
            where: { tenantId, type: 'fees' },
          });

          await prisma.$transaction(async (tx) => {
            // Create a trade for the 10 BTC at 100_000
            const trade = await tx.trade.create({
              data: {
                tenantId,
                price: 100_000,
                quantity: 10,
                instrumentId: btcInstrument.id,
                createdByUserId: superUser.id,
                updatedByUserId: superUser.id,
                createdByMembershipId: null,
                updatedByMembershipId: null,
              },
            });

            // Create fills: buyer1(5), buyer2(5), seller(10)
            const fillBuyer1 = await tx.fill.create({
              data: {
                tenantId,
                side: 'buy',
                price: 100_000,
                quantity: 5,
                fee: 0,
                role: 'maker',
                feeCurrency: 'USD',
                instrumentId: btcInstrument.id,
                orderId: buyer1Order.id,
                tradeId: trade.id,
                createdByUserId: buyer1Order.createdByUserId,
                updatedByUserId: buyer1Order.createdByUserId,
                createdByMembershipId: buyer1Order.createdByMembershipId,
                updatedByMembershipId: buyer1Order.createdByMembershipId,
              },
            });

            const fillBuyer2 = await tx.fill.create({
              data: {
                tenantId,
                side: 'buy',
                price: 100_000,
                quantity: 5,
                fee: 0,
                role: 'maker',
                feeCurrency: 'USD',
                instrumentId: btcInstrument.id,
                orderId: buyer2Order.id,
                tradeId: trade.id,
                createdByUserId: buyer2Order.createdByUserId,
                updatedByUserId: buyer2Order.createdByUserId,
                createdByMembershipId: buyer2Order.createdByMembershipId,
                updatedByMembershipId: buyer2Order.createdByMembershipId,
              },
            });

            const sellerFee = new Prisma.Decimal(100)
              .mul(
                new Prisma.Decimal(10).pow(btcInstrument.quoteAsset.decimals),
              )
              .floor();

            const fillSeller = await tx.fill.create({
              data: {
                tenantId,
                side: 'sell',
                price: 100_000,
                quantity: 10,
                fee: sellerFee,
                role: 'taker',
                feeCurrency: 'USD',
                instrumentId: btcInstrument.id,
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
              const prev = order.quantityFilled || new Prisma.Decimal(0);
              const newQty = new Prisma.Decimal(prev).add(
                new Prisma.Decimal(addQty),
              );
              const status = newQty.greaterThanOrEqualTo(
                new Prisma.Decimal(order.quantity),
              )
                ? 'filled'
                : 'partially_filled';
              await tx.order.update({
                where: { id: order.id },
                data: {
                  quantityFilled: newQty,
                  status,
                  updatedByUserId: order.createdByUserId,
                  updatedByMembershipId: order.createdByMembershipId,
                },
              });
            };

            await updateOrderFilled(buyer1Order, 5);
            await updateOrderFilled(buyer2Order, 5);
            await updateOrderFilled(sellerOrder, 10);

            // Adjust wallets: move locked -> transfer base/quote between accounts
            const baseDec = btcInstrument.underlyingAsset.decimals;
            const quoteDec = btcInstrument.quoteAsset.decimals;
            const baseFactor = new Prisma.Decimal(10).pow(baseDec);
            const quoteFactor = new Prisma.Decimal(10).pow(quoteDec);

            const buyer1BaseAmount = new Prisma.Decimal(5).mul(baseFactor);
            const buyer2BaseAmount = new Prisma.Decimal(5).mul(baseFactor);
            const sellerBaseAmount = new Prisma.Decimal(10).mul(baseFactor);

            const buyer1QuoteLocked = new Prisma.Decimal(100_000)
              .mul(new Prisma.Decimal(5))
              .mul(quoteFactor)
              .floor();
            const buyer2QuoteLocked = buyer1QuoteLocked;
            const sellerQuoteAmount = new Prisma.Decimal(100_000)
              .mul(new Prisma.Decimal(10))
              .mul(quoteFactor)
              .floor();

            // Buyer1: increment BTC available, decrement USD locked
            await tx.wallet.updateMany({
              where: {
                tenantId: tenantId,
                accountId: buyer1Order.accountId,
                assetId: btcInstrument.underlyingAssetId,
              },
              data: {
                available: { increment: buyer1BaseAmount },
                total: { increment: buyer1BaseAmount },
              },
            });
            await tx.wallet.updateMany({
              where: {
                tenantId: tenantId,
                accountId: buyer1Order.accountId,
                assetId: btcInstrument.quoteAssetId,
              },
              data: {
                locked: { decrement: buyer1QuoteLocked },
                total: { decrement: buyer1QuoteLocked },
              },
            });

            // Buyer2: increment BTC available, decrement USD locked
            await tx.wallet.updateMany({
              where: {
                tenantId: tenantId,
                accountId: buyer2Order.accountId,
                assetId: btcInstrument.underlyingAssetId,
              },
              data: {
                available: { increment: buyer2BaseAmount },
                total: { increment: buyer2BaseAmount },
              },
            });
            await tx.wallet.updateMany({
              where: {
                tenantId: tenantId,
                accountId: buyer2Order.accountId,
                assetId: btcInstrument.quoteAssetId,
              },
              data: {
                locked: { decrement: buyer2QuoteLocked },
                total: { decrement: buyer2QuoteLocked },
              },
            });

            // Seller: decrement BTC locked, increment USD available
            await tx.wallet.updateMany({
              where: {
                tenantId: tenantId,
                accountId: sellerOrder.accountId,
                assetId: btcInstrument.underlyingAssetId,
              },
              data: {
                locked: { decrement: sellerBaseAmount },
                total: { decrement: sellerBaseAmount },
              },
            });
            await tx.wallet.updateMany({
              where: {
                tenantId: tenantId,
                accountId: sellerOrder.accountId,
                assetId: btcInstrument.quoteAssetId,
              },
              data: {
                available: { increment: sellerQuoteAmount.sub(sellerFee) },
                total: { increment: sellerQuoteAmount.sub(sellerFee) },
              },
            });

            if (feeAccount) {
              await tx.wallet.updateMany({
                where: {
                  tenantId,
                  accountId: feeAccount.id,
                  assetId: btcInstrument.quoteAssetId,
                },
                data: {
                  available: { increment: sellerFee },
                  total: { increment: sellerFee },
                },
              });
            }

            // Create Ledger Entries for the Trade
            const ledgerEvent = await tx.ledgerEvent.create({
              data: {
                tenantId,
                type: 'trade',
                status: 'completed',
                referenceType: 'Trade',
                referenceId: trade.id,
                createdByUserId: superUser.id,
                updatedByUserId: superUser.id,
                createdByMembershipId: null,
                updatedByMembershipId: null,
              },
            });

            // Buyer 1 Entries
            await tx.ledgerEntry.createMany({
              data: [
                {
                  tenantId,
                  eventId: ledgerEvent.id,
                  accountId: buyer1Order.accountId,
                  // assetId: btcInstrument.quoteAssetId, // USD Out
                  meta: { assetId: btcInstrument.quoteAssetId },
                  amount: new Prisma.Decimal(buyer1QuoteLocked).negated(),
                  createdByUserId: buyer1Order.createdByUserId,
                  updatedByUserId: buyer1Order.createdByUserId,
                  createdByMembershipId: buyer1Order.createdByMembershipId,
                  updatedByMembershipId: buyer1Order.createdByMembershipId,
                },
                {
                  tenantId,
                  eventId: ledgerEvent.id,
                  accountId: buyer1Order.accountId,
                  // assetId: btcInstrument.underlyingAssetId, // BTC In
                  meta: { assetId: btcInstrument.underlyingAssetId },
                  amount: new Prisma.Decimal(buyer1BaseAmount),
                  createdByUserId: buyer1Order.createdByUserId,
                  updatedByUserId: buyer1Order.createdByUserId,
                  createdByMembershipId: buyer1Order.createdByMembershipId,
                  updatedByMembershipId: buyer1Order.createdByMembershipId,
                },
              ],
            });

            // Buyer 2 Entries
            await tx.ledgerEntry.createMany({
              data: [
                {
                  tenantId,
                  eventId: ledgerEvent.id,
                  accountId: buyer2Order.accountId,
                  // assetId: btcInstrument.quoteAssetId, // USD Out
                  meta: { assetId: btcInstrument.quoteAssetId },
                  amount: new Prisma.Decimal(buyer2QuoteLocked).negated(),
                  createdByUserId: buyer2Order.createdByUserId,
                  updatedByUserId: buyer2Order.createdByUserId,
                  createdByMembershipId: buyer2Order.createdByMembershipId,
                  updatedByMembershipId: buyer2Order.createdByMembershipId,
                },
                {
                  tenantId,
                  eventId: ledgerEvent.id,
                  accountId: buyer2Order.accountId,
                  // assetId: btcInstrument.underlyingAssetId, // BTC In
                  meta: { assetId: btcInstrument.underlyingAssetId },
                  amount: new Prisma.Decimal(buyer2BaseAmount),
                  createdByUserId: buyer2Order.createdByUserId,
                  updatedByUserId: buyer2Order.createdByUserId,
                  createdByMembershipId: buyer2Order.createdByMembershipId,
                  updatedByMembershipId: buyer2Order.createdByMembershipId,
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
                  // assetId: btcInstrument.underlyingAssetId, // BTC Out
                  meta: { assetId: btcInstrument.underlyingAssetId },
                  amount: new Prisma.Decimal(sellerBaseAmount).negated(),
                  createdByUserId: sellerOrder.createdByUserId,
                  updatedByUserId: sellerOrder.createdByUserId,
                  createdByMembershipId: sellerOrder.createdByMembershipId,
                  updatedByMembershipId: sellerOrder.createdByMembershipId,
                },
                {
                  tenantId,
                  eventId: ledgerEvent.id,
                  accountId: sellerOrder.accountId,
                  // assetId: btcInstrument.quoteAssetId, // USD In
                  meta: { assetId: btcInstrument.quoteAssetId },
                  amount: new Prisma.Decimal(sellerQuoteAmount).sub(sellerFee),
                  createdByUserId: sellerOrder.createdByUserId,
                  updatedByUserId: sellerOrder.createdByUserId,
                  createdByMembershipId: sellerOrder.createdByMembershipId,
                  updatedByMembershipId: sellerOrder.createdByMembershipId,
                },
              ],
            });

            if (feeAccount) {
              await tx.ledgerEntry.create({
                data: {
                  tenantId,
                  eventId: ledgerEvent.id,
                  accountId: feeAccount.id,
                  meta: { assetId: btcInstrument.quoteAssetId },
                  amount: sellerFee,
                  createdByUserId: null,
                  updatedByUserId: null,
                  createdByMembershipId: null,
                  updatedByMembershipId: null,
                },
              });
            }
          });
        }
      }
    }
  } catch (err) {
    console.error('Error creating matched fills:', err);
  }
}
