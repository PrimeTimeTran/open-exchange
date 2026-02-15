import { PrismaClient, Prisma } from '@prisma/client';
import { OrderType } from '@/proto/common/order';

export async function createOrder(
  prisma: PrismaClient,
  tenantId: string,
  membershipId: string,
  userId: string,
  accountId: string,
  instrument: any,
  orderData: {
    side: string;
    status: string;
    price: number;
    quantity: number;
    quantityFilled?: number;
  },
) {
  const finalPrice = orderData.price;
  const finalQty = orderData.quantity;

  // Lock Funds Logic
  let lockedAmount = new Prisma.Decimal(0);
  let lockAssetId = '';

  if (instrument.underlyingAsset && instrument.quoteAsset) {
    const baseDec = instrument.underlyingAsset.decimals;
    const quoteDec = instrument.quoteAsset.decimals;

    if (
      instrument.type === 'spot' ||
      instrument.type === 'future' ||
      instrument.type === 'option'
    ) {
      if (orderData.side === 'buy') {
        lockedAmount = new Prisma.Decimal(orderData.price)
          .mul(new Prisma.Decimal(orderData.quantity))
          .mul(new Prisma.Decimal(10).pow(quoteDec))
          .floor();
        lockAssetId = instrument.quoteAssetId;
      } else {
        lockedAmount = new Prisma.Decimal(orderData.quantity)
          .mul(new Prisma.Decimal(10).pow(baseDec))
          .floor();
        lockAssetId = instrument.underlyingAssetId;
      }
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId}::text, true)`;
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}::text, true)`;
    await tx.$executeRaw`SELECT set_config('app.current_membership_id', ${membershipId}::text, true)`;

    if (lockAssetId && lockedAmount.gt(0)) {
      await tx.wallet.updateMany({
        where: {
          tenantId,
          accountId: accountId,
          assetId: lockAssetId,
        },
        data: {
          locked: { increment: lockedAmount },
          available: { decrement: lockedAmount },
        },
      });
    }

    await tx.order.create({
      data: {
        tenant: { connect: { id: tenantId } },
        account: { connect: { id: accountId } },
        instrument: { connect: { id: instrument.id } },
        side: orderData.side,
        status: orderData.status,
        price: finalPrice,
        quantity: finalQty,
        timeInFore: 'gtc',
        createdAt: new Date(),
        createdByMembership: { connect: { id: membershipId } },
        updatedByMembership: { connect: { id: membershipId } },
        quantityFilled: orderData.quantityFilled || 0,
        type: OrderType[OrderType.ORDER_TYPE_LIMIT],
      },
    });
  });
}
