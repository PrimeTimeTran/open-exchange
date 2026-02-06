'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CandidateWithRelationships } from 'src/features/candidate/candidateSchemas';
import { candidateFindApiCall } from 'src/features/candidate/candidateApiCalls';
import { CandidateActions } from 'src/features/candidate/components/CandidateActions';
import { candidatePermissions } from 'src/features/candidate/candidatePermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import FileListItem from 'src/features/file/components/FileListItem';
import { candidateLabel } from 'src/features/candidate/candidateLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function CandidateView({
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
    queryKey: ['candidate', id],
    queryFn: async ({ signal }) => {
      return await candidateFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'candidate',
        ]) as Array<CandidateWithRelationships>
      )?.find((d) => d.id === id),
  });

  const candidate = query.data;

  if (query.isSuccess && !candidate) {
    router.push('/candidate');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/candidate');
    return null;
  }

  if (!candidate) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.candidate.list.menu, '/candidate'],
            [candidateLabel(candidate, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <CandidateActions mode="view" candidate={candidate} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(candidate.firstName) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.firstName}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{candidate.firstName}</span>
              <CopyToClipboardButton
                text={candidate.firstName}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(candidate.lastName) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.lastName}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{candidate.lastName}</span>
              <CopyToClipboardButton
                text={candidate.lastName}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(candidate.preferredName) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.preferredName}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{candidate.preferredName}</span>
              <CopyToClipboardButton
                text={candidate.preferredName}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(candidate.email) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.email}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{candidate.email}</span>
              <CopyToClipboardButton
                text={candidate.email}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(candidate.phone) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.phone}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{candidate.phone}</span>
              <CopyToClipboardButton
                text={candidate.phone}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(candidate.country) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.country}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{candidate.country}</span>
              <CopyToClipboardButton
                text={candidate.country}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(candidate.timezone) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.timezone}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{candidate.timezone}</span>
              <CopyToClipboardButton
                text={candidate.timezone}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(candidate.linkedinUrl) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.linkedinUrl}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{candidate.linkedinUrl}</span>
              <CopyToClipboardButton
                text={candidate.linkedinUrl}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(candidate.githubUrl) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.githubUrl}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{candidate.githubUrl}</span>
              <CopyToClipboardButton
                text={candidate.githubUrl}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(candidate.portfolioUrl) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.portfolioUrl}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{candidate.portfolioUrl}</span>
              <CopyToClipboardButton
                text={candidate.portfolioUrl}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(candidate.resumeUrl) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.resumeUrl}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{candidate.resumeUrl}</span>
              <CopyToClipboardButton
                text={candidate.resumeUrl}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean((candidate.resume as Array<any>)?.length) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.resume}
            </div>
            <div className="col-span-2">
              <FileListItem files={candidate.resume as Array<any>} />
            </div>
          </div>
        )}

        {candidate.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={candidate.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  candidate.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {candidate.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(candidate.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(candidate.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {candidate.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={candidate.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  candidate.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {candidate.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(candidate.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(candidate.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {candidate.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={candidate.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  candidate.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {candidate.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.candidate.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(candidate.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(candidate.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
