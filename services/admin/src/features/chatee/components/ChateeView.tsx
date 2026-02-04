'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ChateeWithRelationships } from 'src/features/chatee/chateeSchemas';
import { chateeFindApiCall } from 'src/features/chatee/chateeApiCalls';
import { ChateeActions } from 'src/features/chatee/components/ChateeActions';
import { chateePermissions } from 'src/features/chatee/chateePermissions';
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
import { chateeLabel } from 'src/features/chatee/chateeLabel';

export function ChateeView({
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
    queryKey: ['chatee', id],
    queryFn: async ({ signal }) => {
      return await chateeFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'chatee',
        ]) as Array<ChateeWithRelationships>
      )?.find((d) => d.id === id),
  });

  const chatee = query.data;

  if (query.isSuccess && !chatee) {
    router.push('/chatee');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/chatee');
    return null;
  }

  if (!chatee) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.chatee.list.menu, '/chatee'],
            [chateeLabel(chatee, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <ChateeActions mode="view" chatee={chatee} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(chatee.nickname) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chatee.fields.nickname}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{chatee.nickname}</span>
              <CopyToClipboardButton
                text={chatee.nickname}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {chatee.status != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chatee.fields.status}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.chatee.enumerators.status,
                  chatee.status,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.chatee.enumerators.status,
                  chatee.status,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {chatee.role?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">{dictionary.chatee.fields.role}</div>
          <div className="col-span-2 flex flex-col gap-1">
            {chatee.role.map((value, index) => {
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
        {chatee.user != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chatee.fields.user}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink membership={chatee.user} context={context} />
              <CopyToClipboardButton
                text={membershipLabel(chatee.user, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {chatee.chat != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chatee.fields.chat}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <ChatLink chat={chatee.chat} context={context} />
              <CopyToClipboardButton
                text={chatLabel(chatee.chat, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {chatee.messages?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.chatee.fields.messages}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {chatee.messages?.map((item) => {
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

        {chatee.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chatee.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={chatee.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  chatee.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {chatee.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chatee.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(chatee.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(chatee.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {chatee.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chatee.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={chatee.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  chatee.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {chatee.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chatee.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(chatee.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(chatee.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {chatee.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chatee.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={chatee.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  chatee.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {chatee.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chatee.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(chatee.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(chatee.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
