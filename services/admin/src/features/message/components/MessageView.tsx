'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { MessageWithRelationships } from 'src/features/message/messageSchemas';
import { messageFindApiCall } from 'src/features/message/messageApiCalls';
import { MessageActions } from 'src/features/message/components/MessageActions';
import { messagePermissions } from 'src/features/message/messagePermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import FileListItem from 'src/features/file/components/FileListItem';
import { ImagesInput } from 'src/features/file/components/ImagesInput';
import { chatLabel } from 'src/features/chat/chatLabel';
import { ChatLink } from 'src/features/chat/components/ChatLink';
import { chateeLabel } from 'src/features/chatee/chateeLabel';
import { ChateeLink } from 'src/features/chatee/components/ChateeLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { messageLabel } from 'src/features/message/messageLabel';

export function MessageView({
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
    queryKey: ['message', id],
    queryFn: async ({ signal }) => {
      return await messageFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'message',
        ]) as Array<MessageWithRelationships>
      )?.find((d) => d.id === id),
  });

  const message = query.data;

  if (query.isSuccess && !message) {
    router.push('/message');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/message');
    return null;
  }

  if (!message) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.message.list.menu, '/message'],
            [messageLabel(message, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <MessageActions mode="view" message={message} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(message.body) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.message.fields.body}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{message.body}</span>
              <CopyToClipboardButton
                text={message.body}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean((message.attachment as Array<any>)?.length) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.message.fields.attachment}
            </div>
            <div className="col-span-2">
              <FileListItem files={message.attachment as Array<any>} />
            </div>
          </div>
        )}
        {Boolean((message.images as Array<any>)?.length) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.message.fields.images}
            </div>
            <div className="col-span-2">
              <ImagesInput
                readonly
                value={message.images as any}
                dictionary={dictionary}
              />
            </div>
          </div>
        )}
        {message.type?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">{dictionary.message.fields.type}</div>
          <div className="col-span-2 flex flex-col gap-1">
            {message.type.map((value, index) => {
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
        {message.chat != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.message.fields.chat}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <ChatLink chat={message.chat} context={context} />
              <CopyToClipboardButton
                text={chatLabel(message.chat, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {message.chatee != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.message.fields.chatee}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <ChateeLink chatee={message.chatee} context={context} />
              <CopyToClipboardButton
                text={chateeLabel(message.chatee, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {message.sender != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.message.fields.sender}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink membership={message.sender} context={context} />
              <CopyToClipboardButton
                text={membershipLabel(message.sender, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {message.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.message.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={message.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  message.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {message.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.message.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(message.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(message.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {message.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.message.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={message.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  message.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {message.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.message.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(message.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(message.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {message.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.message.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={message.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  message.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {message.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.message.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(message.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(message.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
