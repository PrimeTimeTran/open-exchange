import { VariantProps } from 'class-variance-authority';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from 'src/shared/components/ui/alert-dialog';
import { Button, buttonVariants } from 'src/shared/components/ui/button';

export interface ConfirmDialogProps
  extends VariantProps<typeof buttonVariants> {
  title: string;
  description?: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  dataTestid?: string;
}

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  variant,
  loading,
  dataTestid,
}: ConfirmDialogProps) {
  return (
    <AlertDialog
      open={true}
      onOpenChange={(open) => (!open && !loading ? onCancel() : null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {Boolean(description) && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            data-testid={dataTestid ? `${dataTestid}-cancel` : undefined}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </AlertDialogCancel>
          {variant ? (
            <Button
              data-testid={dataTestid ? `${dataTestid}-confirm` : undefined}
              variant={variant}
              onClick={onConfirm}
              disabled={loading}
            >
              {confirmText}
            </Button>
          ) : (
            <AlertDialogAction
              data-testid={dataTestid ? `${dataTestid}-confirm` : undefined}
              onClick={onConfirm}
              disabled={loading}
            >
              {confirmText}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
