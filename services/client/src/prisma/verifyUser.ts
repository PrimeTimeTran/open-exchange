import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'primetimetran@gmail.com';
  console.log(`Looking for user with email: ${email}`);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`User with email ${email} not found.`);
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    console.log(
      `Successfully updated user ${updatedUser.email}. emailVerified is now: ${updatedUser.emailVerified}`,
    );
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
