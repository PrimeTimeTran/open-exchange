import { CandidateWithRelationships } from 'src/features/candidate/candidateSchemas';
import { CandidateForm } from 'src/features/candidate/components/CandidateForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function CandidateFormSheet({
  candidate,
  context,
  onCancel,
  onSuccess,
}: {
  candidate?: Partial<CandidateWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (candidate: CandidateWithRelationships) => void;
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
            {candidate?.id
              ? context.dictionary.candidate.edit.title
              : context.dictionary.candidate.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <CandidateForm
            candidate={candidate}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
