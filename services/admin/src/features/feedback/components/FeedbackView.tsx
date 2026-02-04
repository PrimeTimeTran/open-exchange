'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FeedbackWithRelationships } from 'src/features/feedback/feedbackSchemas';
import { feedbackFindApiCall } from 'src/features/feedback/feedbackApiCalls';
import { FeedbackActions } from 'src/features/feedback/components/FeedbackActions';
import { feedbackPermissions } from 'src/features/feedback/feedbackPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import FileListItem from 'src/features/file/components/FileListItem';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { feedbackLabel } from 'src/features/feedback/feedbackLabel';

export function FeedbackView({
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
    queryKey: ['feedback', id],
    queryFn: async ({ signal }) => {
      return await feedbackFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'feedback',
        ]) as Array<FeedbackWithRelationships>
      )?.find((d) => d.id === id),
  });

  const feedback = query.data;

  if (query.isSuccess && !feedback) {
    router.push('/feedback');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/feedback');
    return null;
  }

  if (!feedback) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.feedback.list.menu, '/feedback'],
            [feedbackLabel(feedback, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <FeedbackActions mode="view" feedback={feedback} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(feedback.title) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feedback.fields.title}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{feedback.title}</span>
              <CopyToClipboardButton
                text={feedback.title}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(feedback.description) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feedback.fields.description}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{feedback.description}</span>
              <CopyToClipboardButton
                text={feedback.description}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean((feedback.attachments as Array<any>)?.length) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feedback.fields.attachments}
            </div>
            <div className="col-span-2">
              <FileListItem files={feedback.attachments as Array<any>} />
            </div>
          </div>
        )}
        {feedback.type != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feedback.fields.type}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.feedback.enumerators.type,
                  feedback.type,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.feedback.enumerators.type,
                  feedback.type,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {feedback.status != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feedback.fields.status}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.feedback.enumerators.status,
                  feedback.status,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.feedback.enumerators.status,
                  feedback.status,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {feedback.user != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feedback.fields.user}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink membership={feedback.user} context={context} />
              <CopyToClipboardButton
                text={membershipLabel(feedback.user, context.dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {feedback.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feedback.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={feedback.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  feedback.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {feedback.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feedback.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(feedback.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(feedback.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {feedback.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feedback.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={feedback.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  feedback.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {feedback.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feedback.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(feedback.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(feedback.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {feedback.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feedback.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={feedback.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  feedback.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {feedback.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.feedback.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(feedback.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(feedback.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
