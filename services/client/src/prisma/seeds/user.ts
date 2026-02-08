import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedUser(prisma: PrismaClient) {
  const email = 'primetimetran@gmail.com';
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`Creating user ${email}...`);
    user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash('Asdf!123', 10),
        emailVerified: true,
      },
    });
  }
  return user;
}
