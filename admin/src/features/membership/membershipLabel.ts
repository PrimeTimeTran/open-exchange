import { membershipFullName } from 'src/features/membership/membershipFullName';
import { MembershipWithUser } from 'src/features/membership/membershipSchemas';
import { Dictionary } from 'src/translation/locales';

export function membershipLabel(
  membership?: Partial<MembershipWithUser> | null,
  dictionary?: Dictionary,
) {
  const fullName = membership?.fullName || membershipFullName(membership);
  const email = membership?.user?.email;

  if (fullName && !email) {
    return fullName;
  }

  if (!fullName && email) {
    return email;
  }

  return [fullName, email].filter(Boolean).join(' - ') || '';
}
