import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const instruments = await prisma.instrument.findMany();
  console.log(
    'Instruments:',
    instruments.map((i) => ({ symbol: i.symbol, id: i.id })),
  );

  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: ['open', 'new', 'partial'],
      },
    },
    select: {
      id: true,
      instrumentId: true,
      status: true,
      createdAt: true,
      side: true,
      price: true,
      quantity: true,
    },
  });

  console.log('Open Orders:', orders);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
