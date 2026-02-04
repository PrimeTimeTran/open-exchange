'use client';

import { withdrawalFindManyApiCall } from 'src/features/withdrawal/withdrawalApiCalls';
import DashboardCountCard from 'src/features/dashboard/components/DashboardCountCard';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { LuLayoutGrid } from 'react-icons/lu';

export function WithdrawalDashboardCard({ context }: { context: AppContext }) {
  const { dictionary } = context;

  if (!hasPermission(permissions.withdrawalRead, context)) {
    return null;
  }

  return (
    <DashboardCountCard
      queryFn={async (signal?: AbortSignal) => {
        const { count } = await withdrawalFindManyApiCall(
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
      id="withdrawalDashboardCard"
      queryKey={['withdrawal', 'count']}
      title={dictionary.withdrawal.dashboardCard.title}
      Icon={LuLayoutGrid}
    />
  );
}
