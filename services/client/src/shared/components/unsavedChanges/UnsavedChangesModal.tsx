import NextLink from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from 'src/shared/components/ui/alert-dialog';
import { IUnsavedChangesContext } from 'src/shared/schemas/unsavedChanges';

export const UnsavedChangesModal: React.FC<IUnsavedChangesContext> = ({
  modalContent,
  setModalContent,
  showModal,
  setShowModal,
}) => (
  <AlertDialog
    open={showModal}
    onOpenChange={(isOpen) => {
      setShowModal(isOpen);
    }}
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{modalContent?.message}</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogFooter>
        {modalContent?.saveAction ? (
          <AlertDialogAction onClick={() => modalContent.saveAction!()}>
            {modalContent?.saveLabel}
          </AlertDialogAction>
        ) : null}
        <AlertDialogCancel onClick={() => setShowModal(false)}>
          {modalContent?.dismissButtonLabel}
        </AlertDialogCancel>
        <AlertDialogAction
          asChild
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          <NextLink
            href={modalContent?.proceedLinkHref || '/'}
            onClick={() => {
              setShowModal(false);
              setModalContent(undefined);
            }}
          >
            {modalContent?.proceedLinkLabel}
          </NextLink>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
