import { MembershipWithUser } from 'src/features/membership/membershipSchemas';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';

export function membershipExporterMapper(
  memberships: MembershipWithUser[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return memberships.map((membership) => {
    return {
      id: membership.id,
      fullName: membership.fullName,
      email: membership.user?.email,
      roles: membership.roles
        ?.map((current) =>
          enumeratorLabel(
            context.dictionary.membership.enumerators.roles,
            current,
          ),
        )
        .join(', '),
      status: enumeratorLabel(
        context.dictionary.membership.enumerators.status,
        membership.status,
      ),
      createdAt: String(membership.createdAt),
      updatedAt: String(membership.updatedAt),
    };
  });
}
