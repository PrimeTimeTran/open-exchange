'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArticleWithRelationships } from 'src/features/article/articleSchemas';
import { articleFindApiCall } from 'src/features/article/articleApiCalls';
import { ArticleActions } from 'src/features/article/components/ArticleActions';
import { articlePermissions } from 'src/features/article/articlePermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { ImagesInput } from 'src/features/file/components/ImagesInput';
import FileListItem from 'src/features/file/components/FileListItem';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { articleLabel } from 'src/features/article/articleLabel';

export function ArticleView({
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
    queryKey: ['article', id],
    queryFn: async ({ signal }) => {
      return await articleFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'article',
        ]) as Array<ArticleWithRelationships>
      )?.find((d) => d.id === id),
  });

  const article = query.data;

  if (query.isSuccess && !article) {
    router.push('/article');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/article');
    return null;
  }

  if (!article) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.article.list.menu, '/article'],
            [articleLabel(article, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <ArticleActions mode="view" article={article} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(article.title) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.article.fields.title}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{article.title}</span>
              <CopyToClipboardButton
                text={article.title}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(article.body) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.article.fields.body}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{article.body}</span>
              <CopyToClipboardButton
                text={article.body}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {article.type?.length ? (<div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
          <div className="font-semibold">{dictionary.article.fields.type}</div>
          <div className="col-span-2 flex flex-col gap-1">
            {article.type.map((value, index) => {
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
        {Boolean((article.images as Array<any>)?.length) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.article.fields.images}
            </div>
            <div className="col-span-2">
              <ImagesInput
                readonly
                value={article.images as any}
                dictionary={dictionary}
              />
            </div>
          </div>
        )}
        {Boolean((article.files as Array<any>)?.length) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.article.fields.files}
            </div>
            <div className="col-span-2">
              <FileListItem files={article.files as Array<any>} />
            </div>
          </div>
        )}
        {article.user != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.article.fields.user}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink membership={article.user} context={context} />
              <CopyToClipboardButton
                text={membershipLabel(article.user, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {article.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.article.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={article.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  article.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {article.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.article.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(article.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(article.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {article.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.article.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={article.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  article.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {article.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.article.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(article.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(article.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {article.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.article.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={article.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  article.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {article.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.article.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(article.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(article.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
