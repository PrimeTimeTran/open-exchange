import { Prisma } from '@prisma/client';

export function prismaErrorParser(error: Prisma.PrismaClientKnownRequestError) {
  while (error && error.cause) {
    error = error.cause as Prisma.PrismaClientKnownRequestError;
  }

  return {
    code: error.code,
    message: error.message,
    meta: error.meta,
  };
}
