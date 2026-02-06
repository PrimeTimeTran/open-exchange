'use client';

import { Instrument } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { InstrumentForm } from 'src/features/instrument/components/InstrumentForm';
import { instrumentFindApiCall } from 'src/features/instrument/instrumentApiCalls';
import { instrumentLabel } from 'src/features/instrument/instrumentLabel';
import { InstrumentWithRelationships } from 'src/features/instrument/instrumentSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function InstrumentEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [instrument, setInstrument] = useState<InstrumentWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setInstrument(undefined);
        const instrument = await instrumentFindApiCall(id);

        if (!instrument) {
          router.push('/instrument');
        }

        setInstrument(instrument);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/instrument');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!instrument) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.instrument.list.menu, '/instrument'],
          [instrumentLabel(instrument, context.dictionary), `/instrument/${instrument?.id}`],
          [dictionary.instrument.edit.menu],
        ]}
      />
      <div className="my-10">
        <InstrumentForm
          context={context}
          instrument={instrument}
          onSuccess={(instrument: Instrument) => router.push(`/instrument/${instrument.id}`)}
          onCancel={() => router.push('/instrument')}
        />
      </div>
    </div>
  );
}
