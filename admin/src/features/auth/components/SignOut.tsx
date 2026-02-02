'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authSignOutApiCall } from 'src/features/auth/authApiCalls';
import { toast } from 'src/shared/components/ui/use-toast';
import { Dictionary } from 'src/translation/locales';

export default function SignOut({ dictionary }: { dictionary: Dictionary }) {
  const signOutMutation = useMutation({
    mutationFn: () => {
      return authSignOutApiCall();
    },
    onSuccess: () => {
      window.location.href = '/';
    },
    onError: (error: Error) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    signOutMutation.mutateAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-4 flex flex-col items-center">
      <p className="text-center text-gray-600 dark:text-gray-300">
        {dictionary.auth.signOut.loading}
      </p>
    </div>
  );
}
