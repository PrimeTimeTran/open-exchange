'use client';

import { feeScheduleFindManyApiCall } from 'src/features/feeSchedule/feeScheduleApiCalls';
import DashboardCountCard from 'src/features/dashboard/components/DashboardCountCard';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { LuLayoutGrid } from 'react-icons/lu';

export function FeeScheduleDashboardCard({ context }: { context: AppContext }) {
  const { dictionary } = context;

  if (!hasPermission(permissions.feeScheduleRead, context)) {
    return null;
  }

  return (
    <DashboardCountCard
      queryFn={async (signal?: AbortSignal) => {
        const { count } = await feeScheduleFindManyApiCall(
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
      id="feeScheduleDashboardCard"
      queryKey={['feeSchedule', 'count']}
      title={dictionary.feeSchedule.dashboardCard.title}
      Icon={LuLayoutGrid}
    />
  );
}
