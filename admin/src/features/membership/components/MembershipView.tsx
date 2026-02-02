'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ImagesInput } from 'src/features/file/components/ImagesInput';
import { MembershipActions } from 'src/features/membership/components/MembershipActions';
import { MembershipStatusBadge } from 'src/features/membership/components/MembershipStatusBadge';
import { membershipFindApiCall } from 'src/features/membership/membershipApiCalls';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { MembershipWithUser } from 'src/features/membership/membershipSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';

export function MembershipView({
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
    queryKey: ['membership', id],
    queryFn: async ({ signal }) => {
      return await membershipFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData(['membership']) as Array<MembershipWithUser>
      )?.find((d) => d.id === id),
  });

  const membership = query.data;

  if (query.isSuccess && !membership) {
    router.push('/membership');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/membership');
    return null;
  }

  if (!membership) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Breadcrumb
          items={[
            [dictionary.membership.list.menu, '/membership'],
            [membershipLabel(membership, dictionary)],
          ]}
        />

        <div className="flex gap-2">
          <MembershipActions
            mode="view"
            membership={membership}
            context={context}
          />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(membership.user?.email) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.membership.fields.email}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{membership.user?.email}</span>
              <CopyToClipboardButton
                text={membership.user?.email}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.membership.fields.roles}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {membership.roles.map((value) => {
              return (
                <div key={value} className="flex items-center gap-4">
                  <span>
                    {enumeratorLabel(
                      dictionary.membership.enumerators.roles,
                      value,
                    )}
                  </span>
                  <CopyToClipboardButton
                    text={enumeratorLabel(
                      dictionary.membership.enumerators.roles,
                      value,
                    )}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {Boolean(membership.status) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.membership.fields.status}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipStatusBadge
                membership={membership}
                context={context}
              />
            </div>
          </div>
        )}

        {Boolean(membership.firstName) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.membership.fields.firstName}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{membership.firstName}</span>
              <CopyToClipboardButton
                text={membership.firstName}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {Boolean(membership.lastName) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.membership.fields.lastName}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{membership.lastName}</span>
              <CopyToClipboardButton
                text={membership.lastName}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {Boolean((membership.avatars as Array<any>)?.length) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.membership.fields.avatars}
            </div>
            <div className="col-span-2">
              <ImagesInput
                readonly
                value={membership.avatars as any}
                dictionary={dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
