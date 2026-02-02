'use client';

import { LuUsers } from 'react-icons/lu';
import DashboardCountCard from 'src/features/dashboard/components/DashboardCountCard';
import { membershipFindManyApiCall } from 'src/features/membership/membershipApiCalls';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';

export function MembershipDashboardCard({ context }: { context: AppContext }) {
  const { dictionary } = context;

  if (!hasPermission(permissions.membershipRead, context)) {
    return null;
  }

  return (
    <DashboardCountCard
      queryFn={async (signal?: AbortSignal) => {
        const { count } = await membershipFindManyApiCall(
          {
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
          },
          signal,
        );

        return count;
      }}
      id="membershipDashboardCard"
      queryKey={['membership', 'count']}
      title={dictionary.membership.dashboardCard.title}
      Icon={LuUsers}
    />
  );
}
