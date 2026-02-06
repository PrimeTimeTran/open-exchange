'use client';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { auditLogFindManyApiCall } from 'src/features/auditLog/auditLogApiCalls';
import {
  auditLogOperations,
  auditLogReadableOperation,
} from 'src/features/auditLog/auditLogOperations';
import { membershipFullName } from 'src/features/membership/membershipFullName';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from 'src/shared/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'src/shared/components/ui/card';
import { Skeleton } from 'src/shared/components/ui/skeleton';
import { AppContext } from 'src/shared/controller/appContext';
import { acronym } from 'src/shared/lib/acronym';
import { downloadUrl } from 'src/shared/lib/downloadUrl';

dayjs.extend(relativeTime);

export function AuditLogActivityListCard({ context }: { context: AppContext }) {
  const _hasPermission = hasPermission(permissions.membershipRead, context);

  const query = useQuery({
    queryKey: ['auditLog', 'activityList'],
    queryFn: ({ signal }) => {
      return auditLogFindManyApiCall(
        {
          filter: {
            operations: [
              auditLogOperations.signIn,
              auditLogOperations.signUp,
              auditLogOperations.passwordResetRequest,
              auditLogOperations.passwordResetConfirm,
              auditLogOperations.passwordChange,
              auditLogOperations.verifyEmailRequest,
              auditLogOperations.verifyEmailConfirm,
              auditLogOperations.create,
              auditLogOperations.update,
              auditLogOperations.delete,
            ],
            entityNames: [
              'Membership',
              'Subscription',
              'Customer',
              'Product',
              'Order',
            ],
          },
          take: 5,
          orderBy: {
            timestamp: 'desc',
          },
        },
        signal,
      );
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
          {context.dictionary.auditLog.dashboardCard.activityList}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {query.isLoading && <Skeleton className="h-[350px] w-full" />}
          {query.data?.auditLogs
            .filter((auditLog) => auditLog.authorEmail)
            .map((auditLog) => (
              <div key={auditLog.id} className="flex justify-between">
                <div className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={downloadUrl(auditLog.authorAvatars)}
                      alt={
                        membershipFullName({
                          firstName: auditLog.authorFirstName,
                          lastName: auditLog.authorLastName,
                        }) || auditLog.authorEmail
                      }
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {acronym(
                        auditLog.authorFirstName,
                        auditLog.authorLastName,
                        auditLog.authorEmail,
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p
                      title={auditLog.authorEmail}
                      className="text-sm font-medium leading-none"
                    >
                      {auditLogReadableOperation(auditLog, context.dictionary)}.
                    </p>
                    <p
                      title={dayjs(auditLog.timestamp).format(
                        context.dictionary.shared.datetimeFormat,
                      )}
                      className="text-sm text-muted-foreground"
                    >
                      {dayjs(auditLog.timestamp).fromNow()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
