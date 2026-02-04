'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CommentWithRelationships } from 'src/features/comment/commentSchemas';
import { commentFindApiCall } from 'src/features/comment/commentApiCalls';
import { CommentActions } from 'src/features/comment/components/CommentActions';
import { commentPermissions } from 'src/features/comment/commentPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { ImagesInput } from 'src/features/file/components/ImagesInput';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { commentLabel } from 'src/features/comment/commentLabel';

export function CommentView({
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
    queryKey: ['comment', id],
    queryFn: async ({ signal }) => {
      return await commentFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'comment',
        ]) as Array<CommentWithRelationships>
      )?.find((d) => d.id === id),
  });

  const comment = query.data;

  if (query.isSuccess && !comment) {
    router.push('/comment');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/comment');
    return null;
  }

  if (!comment) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.comment.list.menu, '/comment'],
            [commentLabel(comment, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <CommentActions mode="view" comment={comment} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(comment.body) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.comment.fields.body}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{comment.body}</span>
              <CopyToClipboardButton
                text={comment.body}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {comment.type?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">{dictionary.comment.fields.type}</div>
          <div className="col-span-2 flex flex-col gap-1">
            {comment.type.map((value, index) => {
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
        {Boolean((comment.images as Array<any>)?.length) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.comment.fields.images}
            </div>
            <div className="col-span-2">
              <ImagesInput
                readonly
                value={comment.images as any}
                dictionary={dictionary}
              />
            </div>
          </div>
        )}
        {comment.user != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.comment.fields.user}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink membership={comment.user} context={context} />
              <CopyToClipboardButton
                text={membershipLabel(comment.user, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {comment.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.comment.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={comment.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  comment.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {comment.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.comment.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(comment.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(comment.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {comment.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.comment.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={comment.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  comment.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {comment.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.comment.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(comment.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(comment.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {comment.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.comment.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={comment.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  comment.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {comment.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.comment.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(comment.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(comment.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
