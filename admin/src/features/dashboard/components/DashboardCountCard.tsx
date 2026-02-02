import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'src/shared/components/ui/card';
import { Skeleton } from 'src/shared/components/ui/skeleton';

export default function DashboardCountCard({
  title,
  Icon,
  id,
  queryKey,
  queryFn,
}: {
  title: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  id: string;
  queryKey: string[];
  queryFn: (signal?: AbortSignal) => Promise<number>;
}) {
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => queryFn(signal),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : ''}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {query.isSuccess ? (
            <span data-testid={`${id}-count`}>{query.data}</span>
          ) : (
            <Skeleton className="h-[30px] w-full" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
