'use client';

import { marketMakerFindManyApiCall } from 'src/features/marketMaker/marketMakerApiCalls';
import DashboardCountCard from 'src/features/dashboard/components/DashboardCountCard';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { LuLayoutGrid } from 'react-icons/lu';

export function MarketMakerDashboardCard({ context }: { context: AppContext }) {
  const { dictionary } = context;

  if (!hasPermission(permissions.marketMakerRead, context)) {
    return null;
  }

  return (
    <DashboardCountCard
      queryFn={async (signal?: AbortSignal) => {
        const { count } = await marketMakerFindManyApiCall(
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
      id="marketMakerDashboardCard"
      queryKey={['marketMaker', 'count']}
      title={dictionary.marketMaker.dashboardCard.title}
      Icon={LuLayoutGrid}
    />
  );
}
