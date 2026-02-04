'use client';

import { useRouter } from 'next/navigation';
import { ApiKeyWithMembership } from 'src/features/apiKey/apiKeySchemas';
import { ApiKeyForm } from 'src/features/apiKey/components/ApiKeyForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function ApiKeyEdit({
  context,
  apiKey,
}: {
  context: AppContext;
  apiKey: Partial<ApiKeyWithMembership>;
}) {
  const router = useRouter();

  return (
    <ApiKeyForm
      context={context}
      apiKey={apiKey}
      onSuccess={(apiKey: unknown) => router.push('/api-key')}
      onCancel={() => router.push('/api-key')}
    />
  );
}
