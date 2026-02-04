import { useMutation } from '@tanstack/react-query';
import {
  membershipAcceptInvitationApiCall,
  membershipDeclineInvitationApiCall,
} from 'src/features/membership/membershipApiCalls';
import { MembershipWithTenant } from 'src/features/membership/membershipSchemas';
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
import { Button } from 'src/shared/components/ui/button';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { formatTranslation } from 'src/translation/formatTranslation';

export function TenantInvitationDialog({
  context,
  membership,
  onClose,
}: {
  membership: MembershipWithTenant;
  context: AppContext;
  onClose: () => void;
}) {
  const { dictionary } = context;

  const acceptMutation = useMutation({
    mutationFn: () => {
      return membershipAcceptInvitationApiCall(
        membership.invitationToken || '',
      );
    },
    onSuccess: () => {
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: () => {
      return membershipDeclineInvitationApiCall(
        membership.invitationToken || '',
      );
    },
    onSuccess: () => {
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const isLoading = acceptMutation.isPending || declineMutation.isPending;

  return (
    <AlertDialog
      open={true}
      onOpenChange={() => (isLoading ? null : onClose())}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {formatTranslation(
              dictionary.tenant.invite.title,
              membership?.tenant?.name,
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {formatTranslation(
              dictionary.tenant.invite.message,
              membership?.tenant?.name,
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {dictionary.shared.cancel}
          </AlertDialogCancel>
          <Button
            variant={'destructive'}
            onClick={() => declineMutation.mutateAsync()}
            disabled={isLoading}
          >
            {dictionary.shared.decline}
          </Button>
          <AlertDialogAction
            disabled={isLoading}
            onClick={() => acceptMutation.mutateAsync()}
          >
            {dictionary.shared.accept}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
