import 'dotenv/config';
import 'tsconfig-paths/register';
import { prismaCreateAppUser } from 'src/prisma/prismaCreateAppUser';
import { prismaCreateTriggers } from 'src/prisma/prismaCreateTriggers';

prismaCreateTriggers()
  .then(() => prismaCreateAppUser())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
