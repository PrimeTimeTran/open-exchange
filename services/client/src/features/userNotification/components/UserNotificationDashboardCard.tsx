'use client';

import { userNotificationFindManyApiCall } from 'src/features/userNotification/userNotificationApiCalls';
import DashboardCountCard from 'src/features/dashboard/components/DashboardCountCard';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import { LuLayoutGrid } from 'react-icons/lu';

export function UserNotificationDashboardCard({ context }: { context: AppContext }) {
  const { dictionary } = context;

  if (!hasPermission(permissions.userNotificationRead, context)) {
    return null;
  }

  return (
    <DashboardCountCard
      queryFn={async (signal?: AbortSignal) => {
        const { count } = await userNotificationFindManyApiCall(
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
      id="userNotificationDashboardCard"
      queryKey={['userNotification', 'count']}
      title={dictionary.userNotification.dashboardCard.title}
      Icon={LuLayoutGrid}
    />
  );
}
