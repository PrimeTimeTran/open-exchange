import { Membership, User } from '@prisma/client';
import { acronym } from 'src/shared/lib/acronym';

export function membershipAcronym(
  user?: Partial<User> | null | undefined,
  membership?: Partial<Membership> | null | undefined,
) {
  return acronym(membership?.firstName, membership?.lastName, user?.email);
}
