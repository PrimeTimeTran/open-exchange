export function membershipFullName(
  data?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null,
) {
  return [data?.firstName, data?.lastName].filter(Boolean).join(' ') || null;
}
