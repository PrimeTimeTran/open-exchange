'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import SignOutButton from 'src/features/auth/components/SignOutButton';
import { membershipAcceptInvitationApiCall } from 'src/features/membership/membershipApiCalls';
import { UserWithMemberships } from 'src/features/user/userSchemas';
import { Button } from 'src/shared/components/ui/button';
import { Dictionary } from 'src/translation/locales';

export function Invitation({
  dictionary,
  currentUser,
}: {
  dictionary: Dictionary;
  currentUser?: UserWithMemberships | null;
}) {
  const router = useRouter();

  const [warningMessage, setWarningMessage] = useState<string>();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      invitationMutation.mutateAsync({ token });
    } else {
      router.push(`/`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const invitationMutation = useMutation({
    mutationFn: ({
      token,
      forceAcceptOtherEmail,
    }: {
      token: string;
      forceAcceptOtherEmail?: boolean;
    }) => {
      return membershipAcceptInvitationApiCall(token, forceAcceptOtherEmail);
    },

    onSuccess: (response) => {
      if (response.status === 'ok') {
        setWarningMessage('');
        router.push(`/`);
      }

      if (response.status === 'warning') {
        setWarningMessage(response.message);
      }
    },
  });

  return (
    <div className="mt-4 flex flex-col items-center">
      {!invitationMutation.isSuccess && !invitationMutation.isError && (
        <p className="text-center text-gray-600 dark:text-gray-300">
          {dictionary.auth.invitation.loadingMessage}
        </p>
      )}

      {!invitationMutation.isPending && Boolean(warningMessage) && (
        <>
          <p className="mb-4 text-center font-medium text-gray-800 dark:text-gray-200">
            {warningMessage}
          </p>

          <Button
            type="button"
            data-testid="btn-force-accept-other-email"
            onClick={() => {
              invitationMutation.mutateAsync({
                token: token!,
                forceAcceptOtherEmail: true,
              });
            }}
          >
            {dictionary.auth.invitation.acceptWrongEmail}
          </Button>
        </>
      )}

      {invitationMutation.isError && (
        <p
          data-testid="error"
          className="text-center text-red-600 dark:text-red-300"
        >
          {dictionary.auth.invitation.invalidToken}
        </p>
      )}

      {invitationMutation.isSuccess && !Boolean(warningMessage) && (
        <p
          data-testid="error"
          className="text-center text-gray-600 dark:text-gray-300"
        >
          {dictionary.auth.invitation.success}
        </p>
      )}

      {currentUser && (
        <SignOutButton
          className="mt-8 block text-center text-sm font-medium text-gray-800 hover:underline dark:text-gray-200"
          text={dictionary.auth.signOut.button}
          dictionary={dictionary}
        />
      )}
    </div>
  );
}
