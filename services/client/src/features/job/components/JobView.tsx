'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { JobWithRelationships } from 'src/features/job/jobSchemas';
import { jobFindApiCall } from 'src/features/job/jobApiCalls';
import { JobActions } from 'src/features/job/components/JobActions';
import { jobPermissions } from 'src/features/job/jobPermissions';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { jobLabel } from 'src/features/job/jobLabel';
import { MembershipLink } from 'src/features/membership/components/MembershipLink';
import { membershipLabel } from 'src/features/membership/membershipLabel';

export function JobView({
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
    queryKey: ['job', id],
    queryFn: async ({ signal }) => {
      return await jobFindApiCall(id, signal);
    },
    initialData: () =>
      (
        queryClient.getQueryData([
          'job',
        ]) as Array<JobWithRelationships>
      )?.find((d) => d.id === id),
  });

  const job = query.data;

  if (query.isSuccess && !job) {
    router.push('/job');
    return null;
  }

  if (query.isError) {
    toast({
      description:
        (query.error as any).message || dictionary.shared.errors.unknown,
      variant: 'destructive',
    });
    router.push('/job');
    return null;
  }

  if (!job) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            [dictionary.job.list.menu, '/job'],
            [jobLabel(job, dictionary)],
          ]}
        />
        <div className="flex gap-2">
          <JobActions mode="view" job={job} context={context} />
        </div>
      </div>

      <div className="my-6 divide-y border-t">
        {Boolean(job.title) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.title}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{job.title}</span>
              <CopyToClipboardButton
                text={job.title}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(job.team) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.team}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{job.team}</span>
              <CopyToClipboardButton
                text={job.team}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(job.location) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.location}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{job.location}</span>
              <CopyToClipboardButton
                text={job.location}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {job.type != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.type}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.job.enumerators.type,
                  job.type,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.job.enumerators.type,
                  job.type,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {job.remote != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.remote}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {job.remote
                  ? dictionary.shared.yes
                  : dictionary.shared.no}
              </span>
              <CopyToClipboardButton
                text={
                  job.remote
                    ? dictionary.shared.yes
                    : dictionary.shared.no
                }
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(job.description) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.description}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{job.description}</span>
              <CopyToClipboardButton
                text={job.description}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(job.requirements) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.requirements}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{job.requirements}</span>
              <CopyToClipboardButton
                text={job.requirements}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(job.responsibilities) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.responsibilities}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{job.responsibilities}</span>
              <CopyToClipboardButton
                text={job.responsibilities}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {job.quantity != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.quantity}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{job.quantity}</span>
              <CopyToClipboardButton
                text={job.quantity.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {job.salaryLow != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.salaryLow}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{job.salaryLow}</span>
              <CopyToClipboardButton
                text={job.salaryLow.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {job.salaryHigh != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.salaryHigh}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{job.salaryHigh}</span>
              <CopyToClipboardButton
                text={job.salaryHigh.toString()}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {job.status != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.status}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.job.enumerators.status,
                  job.status,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.job.enumerators.status,
                  job.status,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {job.seniority != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.seniority}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>
                {enumeratorLabel(
                  dictionary.job.enumerators.seniority,
                  job.seniority,
                )}
              </span>
              <CopyToClipboardButton
                text={enumeratorLabel(
                  dictionary.job.enumerators.seniority,
                  job.seniority,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
        {Boolean(job.currency) && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.currency}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{job.currency}</span>
              <CopyToClipboardButton
                text={job.currency}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {job.createdByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.createdByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={job.createdByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  job.createdByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {job.createdAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.createdAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(job.createdAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(job.createdAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {job.updatedByMembership != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.updatedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={job.updatedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  job.updatedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {job.updatedAt != null && (
          <div className="grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.updatedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(job.updatedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(job.updatedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {job.archivedByMembership != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.archivedByMembership}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <MembershipLink
                membership={job.archivedByMembership}
                context={context}
              />
              <CopyToClipboardButton
                text={membershipLabel(
                  job.archivedByMembership,
                  context.dictionary,
                )}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}

        {job.archivedAt != null && (
          <div className="group grid grid-cols-3 gap-4 py-4 text-sm lg:grid-cols-4">
            <div className="font-semibold">
              {dictionary.job.fields.archivedAt}
            </div>
            <div className="col-span-2 flex items-baseline gap-4 lg:col-span-3">
              <span>{formatDatetime(job.archivedAt, dictionary)}</span>
              <CopyToClipboardButton
                text={formatDatetime(job.archivedAt, dictionary)}
                dictionary={context.dictionary}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
