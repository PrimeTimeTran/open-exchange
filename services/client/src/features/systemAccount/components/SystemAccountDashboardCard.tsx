'use client';

import { systemAccountFindManyApiCall } from 'src/features/systemAccount/systemAccountApiCalls';
import DashboardCountCard from 'src/features/dashboard/components/DashboardCountCard';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { LuLayoutGrid } from 'react-icons/lu';

export function SystemAccountDashboardCard({ context }: { context: AppContext }) {
  const { dictionary } = context;

  if (!hasPermission(permissions.systemAccountRead, context)) {
    return null;
  }

  return (
    <DashboardCountCard
      queryFn={async (signal?: AbortSignal) => {
        const { count } = await systemAccountFindManyApiCall(
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
      id="systemAccountDashboardCard"
      queryKey={['systemAccount', 'count']}
      title={dictionary.systemAccount.dashboardCard.title}
      Icon={LuLayoutGrid}
    />
  );
}
