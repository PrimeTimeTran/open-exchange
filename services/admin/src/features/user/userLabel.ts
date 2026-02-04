import { User } from '@prisma/client';

export function userLabel(user?: User | null) {
  return user?.email;
}
