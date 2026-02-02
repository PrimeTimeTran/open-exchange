'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import { authSignOutApiCall } from 'src/features/auth/authApiCalls';
import { toast } from 'src/shared/components/ui/use-toast';
import { Dictionary, Locale } from 'src/translation/locales';

export default function SignOutButton({
  text,
  disabled,
  className,
  dictionary,
}: {
  className: string;
  text: string;
  disabled?: boolean;
  dictionary: Dictionary;
}) {
  const signOutMutation = useMutation({
    mutationFn: () => {
      return authSignOutApiCall();
    },
    onSuccess: () => {
      window.location.href = `/`;
    },
    onError: (error: Error) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  return (
    <button
      onClick={() => signOutMutation.mutateAsync()}
      className={className}
      disabled={disabled || signOutMutation.isPending}
    >
      {text}
    </button>
  );
}
