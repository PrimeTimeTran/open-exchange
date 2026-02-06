'use client';

import { ledgerEventFindManyApiCall } from 'src/features/ledgerEvent/ledgerEventApiCalls';
import DashboardCountCard from 'src/features/dashboard/components/DashboardCountCard';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { LuLayoutGrid } from 'react-icons/lu';

export function LedgerEventDashboardCard({ context }: { context: AppContext }) {
  const { dictionary } = context;

  if (!hasPermission(permissions.ledgerEventRead, context)) {
    return null;
  }

  return (
    <DashboardCountCard
      queryFn={async (signal?: AbortSignal) => {
        const { count } = await ledgerEventFindManyApiCall(
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
      id="ledgerEventDashboardCard"
      queryKey={['ledgerEvent', 'count']}
      title={dictionary.ledgerEvent.dashboardCard.title}
      Icon={LuLayoutGrid}
    />
  );
}
