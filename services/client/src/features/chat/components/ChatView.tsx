'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ChatWithRelationships } from 'src/features/chat/chatSchemas';
import { chatFindApiCall } from 'src/features/chat/chatApiCalls';
import { ChatActions } from 'src/features/chat/components/ChatActions';
import { chatPermissions } from 'src/features/chat/chatPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { ImagesInput } from 'src/features/file/components/ImagesInput';
import { messageLabel } from 'src/features/message/messageLabel';
import { MessageLink } from 'src/features/message/components/MessageLink';
import { chaterLabel } from 'src/features/chater/chaterLabel';
import { ChaterLink } from 'src/features/chater/components/ChaterLink';
import { chatLabel } from 'src/features/chat/chatLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function ChatView({
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
    queryKey: ['chat', id],
    queryFn: async ({ signal }) => {
      return await chatFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'chat',
        ]) as Array<ChatWithRelationships>
      )?.find((d) => d.id === id),
  });

  const chat = query.data;

  if (query.isSuccess && !chat) {
    router.push('/chat');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/chat');
    return null;
  }

  if (!chat) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.chat.list.menu, '/chat'],
            [chatLabel(chat, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <ChatActions mode="view" chat={chat} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(chat.name) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chat.fields.name}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{chat.name}</span>
              <CopyToClipboardButton
                text={chat.name}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean((chat.media as Array<any>)?.length) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chat.fields.media}
            </div>
            <div className="col-span-2">
              <ImagesInput
                readonly
                value={chat.media as any}
                dictionary={dictionary}
              />
            </div>
          </div>
        )}
        {chat.active != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chat.fields.active}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {chat.active
                  ? dictionary.shared.yes
                  : dictionary.shared.no}
              </span>
              <CopyToClipboardButton
                text={
                  chat.active
                    ? dictionary.shared.yes
                    : dictionary.shared.no
                }
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {chat.messages?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.chat.fields.messages}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {chat.messages?.map((item) => {
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
        {chat.chaters?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">
            {dictionary.chat.fields.chaters}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            {chat.chaters?.map((item) => {
              return (
                <div key={item?.id} className="flex items-center gap-4">
                  <ChaterLink
                    chater={item}
                    context={context}
                    className="whitespace-nowrap"
                  />
                  <CopyToClipboardButton
                    text={chaterLabel(item, context.dictionary)}
                    dictionary={context.dictionary}
                  />
                </div>
              );
            })}
          </div>
        </div>): null}

        {chat.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chat.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={chat.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  chat.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {chat.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chat.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(chat.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(chat.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {chat.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chat.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={chat.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  chat.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {chat.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chat.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(chat.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(chat.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {chat.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chat.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={chat.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  chat.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {chat.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.chat.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(chat.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(chat.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
