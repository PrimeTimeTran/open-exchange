'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { PostWithRelationships } from 'src/features/post/postSchemas';
import { postFindApiCall } from 'src/features/post/postApiCalls';
import { PostActions } from 'src/features/post/components/PostActions';
import { postPermissions } from 'src/features/post/postPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import FileListItem from 'src/features/file/components/FileListItem';
import { ImagesInput } from 'src/features/file/components/ImagesInput';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { postLabel } from 'src/features/post/postLabel';

export function PostView({
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
    queryKey: ['post', id],
    queryFn: async ({ signal }) => {
      return await postFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'post',
        ]) as Array<PostWithRelationships>
      )?.find((d) => d.id === id),
  });

  const post = query.data;

  if (query.isSuccess && !post) {
    router.push('/post');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/post');
    return null;
  }

  if (!post) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.post.list.menu, '/post'],
            [postLabel(post, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <PostActions mode="view" post={post} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(post.title) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.post.fields.title}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{post.title}</span>
              <CopyToClipboardButton
                text={post.title}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(post.body) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.post.fields.body}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{post.body}</span>
              <CopyToClipboardButton
                text={post.body}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean((post.files as Array<any>)?.length) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.post.fields.files}
            </div>
            <div className="col-span-2">
              <FileListItem files={post.files as Array<any>} />
            </div>
          </div>
        )}
        {Boolean((post.images as Array<any>)?.length) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.post.fields.images}
            </div>
            <div className="col-span-2">
              <ImagesInput
                readonly
                value={post.images as any}
                dictionary={dictionary}
              />
            </div>
          </div>
        )}
        {post.type?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">{dictionary.post.fields.type}</div>
          <div className="col-span-2 flex flex-col gap-1">
            {post.type.map((value, index) => {
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
        {post.user != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.post.fields.user}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink membership={post.user} context={context} />
              <CopyToClipboardButton
                text={membershipLabel(post.user, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {post.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.post.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={post.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  post.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {post.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.post.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(post.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(post.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {post.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.post.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={post.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  post.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {post.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.post.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(post.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(post.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {post.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.post.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={post.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  post.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {post.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.post.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(post.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(post.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
