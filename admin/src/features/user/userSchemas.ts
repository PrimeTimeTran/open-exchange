import { User } from '@prisma/client';
import { MembershipWithTenant } from 'src/features/membership/membershipSchemas';

export interface UserWithMemberships extends User {
  memberships?: Array<MembershipWithTenant>;
}
