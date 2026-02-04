'use client';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { times } from 'lodash';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { auditLogFetchActivityChartApiCall } from 'src/features/auditLog/auditLogApiCalls';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'src/shared/components/ui/card';
import { Skeleton } from 'src/shared/components/ui/skeleton';
import { AppContext } from 'src/shared/controller/appContext';

export function AuditLogActivityChartCard({
  context,
}: {
  context: AppContext;
}) {
  const _hasPermission = hasPermission(permissions.membershipRead, context);

  const query = useQuery({
    queryKey: ['auditLog', 'activityChart'],
    queryFn: async ({ signal }) => {
      const activities = await auditLogFetchActivityChartApiCall({ signal });

      return times(7)
        .map((index) => {
          const activity = activities.find((activity) =>
            dayjs(activity.timestamp).isSame(
              dayjs().subtract(index, 'day'),
              'day',
            ),
          );

          if (activity) {
            return {
              timestamp: dayjs(activity.timestamp, 'YYYY-MM-DD').format(
                context.dictionary.shared.dateFormat,
              ),
              count: activity.count,
            };
          }

          return {
            timestamp: dayjs()
              .subtract(index, 'day')
              .format(context.dictionary.shared.dateFormat),
            count: 0,
          };
        })
        .reverse();
    },
    enabled: _hasPermission,
  });

  if (!_hasPermission) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {context.dictionary.auditLog.dashboardCard.activityChart}
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        {query.isLoading ? (
          <div className="pl-4">
            <Skeleton className="h-[350px] w-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={query.data}>
              <XAxis
                dataKey="timestamp"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Bar dataKey="count" fill="#adfa1d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
