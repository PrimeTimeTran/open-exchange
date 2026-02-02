'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { SystemAccountWithRelationships } from 'src/features/systemAccount/systemAccountSchemas';
import { systemAccountFindApiCall } from 'src/features/systemAccount/systemAccountApiCalls';
import { SystemAccountActions } from 'src/features/systemAccount/components/SystemAccountActions';
import { systemAccountPermissions } from 'src/features/systemAccount/systemAccountPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { systemAccountLabel } from 'src/features/systemAccount/systemAccountLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function SystemAccountView({
  id,
  context,
}: {
  id: string;
  context: AppContext;
}) {
  const { dictionary } = context;
  const queryClient = useQueryClient();
  const router = useRouter();

  const query = useQuery({
    queryKey: ['systemAccount', id],
    queryFn: async ({ signal }) => {
      return await systemAccountFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'systemAccount',
        ]) as Array<SystemAccountWithRelationships>
      )?.find((d) => d.id === id),
  });

  const systemAccount = query.data;

  if (query.isSuccess && !systemAccount) {
    router.push('/system-account');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/system-account');
    return null;
  }

  if (!systemAccount) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.systemAccount.list.menu, '/system-account'],
            [systemAccountLabel(systemAccount, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <SystemAccountActions mode="view" systemAccount={systemAccount} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {systemAccount.type != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.systemAccount.fields.type}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.systemAccount.enumerators.type,
                  systemAccount.type,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.systemAccount.enumerators.type,
                  systemAccount.type,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(systemAccount.name) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.systemAccount.fields.name}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{systemAccount.name}</span>
              <CopyToClipboardButton
                text={systemAccount.name}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(systemAccount.description) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.systemAccount.fields.description}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{systemAccount.description}</span>
              <CopyToClipboardButton
                text={systemAccount.description}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {systemAccount.isActive != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.systemAccount.fields.isActive}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {systemAccount.isActive
                  ? dictionary.shared.yes
                  : dictionary.shared.no}
              </span>
              <CopyToClipboardButton
                text={
                  systemAccount.isActive
                    ? dictionary.shared.yes
                    : dictionary.shared.no
                }
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {systemAccount.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.systemAccount.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={systemAccount.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  systemAccount.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {systemAccount.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.systemAccount.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(systemAccount.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(systemAccount.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {systemAccount.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.systemAccount.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={systemAccount.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  systemAccount.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {systemAccount.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.systemAccount.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(systemAccount.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(systemAccount.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {systemAccount.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.systemAccount.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={systemAccount.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  systemAccount.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {systemAccount.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.systemAccount.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(systemAccount.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(systemAccount.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
