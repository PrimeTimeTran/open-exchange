'use client';

import { Instrument } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { InstrumentForm } from 'src/features/instrument/components/InstrumentForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function InstrumentNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <InstrumentForm
      context={context}
      onSuccess={(instrument: Instrument) =>
        router.push(`/instrument/${instrument.id}`)
      }
      onCancel={() => router.push('/instrument')}
    />
  );
}
