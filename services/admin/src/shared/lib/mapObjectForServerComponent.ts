import { Prisma } from '@prisma/client';

export function cleanObjectForServerComponent<T>(object: T) {
  return JSON.parse(JSON.stringify(object)) as T;
}
