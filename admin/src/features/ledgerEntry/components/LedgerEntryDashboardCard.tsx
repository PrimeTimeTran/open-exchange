'use client';

import { ledgerEntryFindManyApiCall } from 'src/features/ledgerEntry/ledgerEntryApiCalls';
import DashboardCountCard from 'src/features/dashboard/components/DashboardCountCard';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { LuLayoutGrid } from 'react-icons/lu';

export function LedgerEntryDashboardCard({ context }: { context: AppContext }) {
  const { dictionary } = context;

  if (!hasPermission(permissions.ledgerEntryRead, context)) {
    return null;
  }

  return (
    <DashboardCountCard
      queryFn={async (signal?: AbortSignal) => {
        const { count } = await ledgerEntryFindManyApiCall(
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
      id="ledgerEntryDashboardCard"
      queryKey={['ledgerEntry', 'count']}
      title={dictionary.ledgerEntry.dashboardCard.title}
      Icon={LuLayoutGrid}
    />
  );
}
