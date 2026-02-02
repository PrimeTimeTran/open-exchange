'use client';

import { ApiKey } from '@prisma/client';
import { isString } from 'lodash';
import Link from 'src/shared/components/Link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { ApiKeyForm } from 'src/features/apiKey/components/ApiKeyForm';
import { CopyToClipboardButton } from 'src/shared/components/CopyToClipboardButton';
import { Button } from 'src/shared/components/ui/button';
import { AppContext } from 'src/shared/controller/appContext';

export default function ApiKeyNew({ context }: { context: AppContext }) {
  const [apiKeySecret, setApiKeySecret] = useState('');
  const router = useRouter();

  if (apiKeySecret) {
    return (
      <>
        <p>{context.dictionary.apiKey.new.text}</p>
        <p className="mt-2">{context.dictionary.apiKey.new.subtext}</p>
        <div className="mt-4 flex items-baseline gap-4">
          <span className="rounded-md border p-4" data-testid="api-key-secret">
            {apiKeySecret}
          </span>
          <CopyToClipboardButton
            text={apiKeySecret}
            dictionary={context.dictionary}
          />
        </div>
        <Link href="/api-key" prefetch={false}>
          <Button className="mt-4">
            {context.dictionary.apiKey.new.backToApiKeys}
          </Button>
        </Link>
      </>
    );
  }

  return (
    <ApiKeyForm
      context={context}
      onSuccess={(response: any) => setApiKeySecret(response.apiKey)}
      onCancel={() => router.push('/api-key')}
    />
  );
}
