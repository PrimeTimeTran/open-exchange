'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ChaterWithRelationships } from 'src/features/chater/chaterSchemas';
import { chaterFindApiCall } from 'src/features/chater/chaterApiCalls';
import { ChaterActions } from 'src/features/chater/components/ChaterActions';
import { chaterPermissions } from 'src/features/chater/chaterPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { chatLabel } from 'src/features/chat/chatLabel';
import { ChatLink } from 'src/features/chat/components/ChatLink';
import { messageLabel } from 'src/features/message/messageLabel';
import { MessageLink } from 'src/features/message/components/MessageLink';
import { chaterLabel } from 'src/features/chater/chaterLabel';

export function ChaterView({
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
    queryKey: ['chater', id],
    queryFn: async ({ signal }) => {
      return await chaterFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'chater',
        ]) as Array<ChaterWithRelationships>
      )?.find((d) => d.id === id),
  });

  const chater = query.data;

  if (query.isSuccess && !chater) {
    router.push('/chater');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/chater');
    return null;
  }

  if (!chater) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.chater.list.menu, '/chater'],
            [chaterLabel(chater, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <ChaterActions mode="view" chater={chater} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(chater.nickname) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chater.fields.nickname}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{chater.nickname}</span>
              <CopyToClipboardButton
                text={chater.nickname}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {chater.status != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chater.fields.status}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.chater.enumerators.status,
                  chater.status,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.chater.enumerators.status,
                  chater.status,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {chater.role?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">{dictionary.chater.fields.role}</div>
          <div className="col-span-2 flex flex-col gap-1">
            {chater.role.map((value, index) => {
              return (
                <div key={index} className="flex items-center gap-4">
                  <span>{value}</span>
                  <CopyToClipboardButton
                    text={value}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}
        {chater.user != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chater.fields.user}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink membership={chater.user} context={context} />
              <CopyToClipboardButton
                text={membershipLabel(chater.user, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {chater.chat != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chater.fields.chat}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <ChatLink chat={chater.chat} context={context} />
              <CopyToClipboardButton
                text={chatLabel(chater.chat, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {chater.messages?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.chater.fields.messages}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {chater.messages?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <MessageLink
                    message={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={messageLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}

        {chater.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chater.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={chater.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  chater.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {chater.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chater.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(chater.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(chater.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {chater.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chater.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={chater.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  chater.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {chater.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chater.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(chater.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(chater.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {chater.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chater.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={chater.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  chater.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {chater.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chater.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(chater.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(chater.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
