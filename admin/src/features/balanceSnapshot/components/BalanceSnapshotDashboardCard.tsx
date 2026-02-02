'use client';

import { balanceSnapshotFindManyApiCall } from 'src/features/balanceSnapshot/balanceSnapshotApiCalls';
import DashboardCountCard from 'src/features/dashboard/components/DashboardCountCard';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { LuLayoutGrid } from 'react-icons/lu';

export function BalanceSnapshotDashboardCard({ context }: { context: AppContext }) {
  const { dictionary } = context;

  if (!hasPermission(permissions.balanceSnapshotRead, context)) {
    return null;
  }

  return (
    <DashboardCountCard
      queryFn={async (signal?: AbortSignal) => {
        const { count } = await balanceSnapshotFindManyApiCall(
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
      id="balanceSnapshotDashboardCard"
      queryKey={['balanceSnapshot', 'count']}
      title={dictionary.balanceSnapshot.dashboardCard.title}
      Icon={LuLayoutGrid}
    />
  );
}
