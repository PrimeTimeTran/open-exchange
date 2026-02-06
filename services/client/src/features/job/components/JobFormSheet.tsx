import { JobWithRelationships } from 'src/features/job/jobSchemas';
import { JobForm } from 'src/features/job/components/JobForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function JobFormSheet({
  job,
  context,
  onCancel,
  onSuccess,
}: {
  job?: Partial<JobWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (job: JobWithRelationships) => void;
}) {
  return (
    <Sheet
      open={true}
      onOpenChange={(open) => (!open ? onCancel() : null)}
      modal={true}
    >
      <SheetContent className="overflow-y-scroll sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {job?.id
              ? context.dictionary.job.edit.title
              : context.dictionary.job.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <JobForm
            job={job}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
