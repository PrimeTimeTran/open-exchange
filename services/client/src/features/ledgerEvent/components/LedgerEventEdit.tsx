'use client';

import { LedgerEvent } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LedgerEventForm } from 'src/features/ledgerEvent/components/LedgerEventForm';
import { ledgerEventFindApiCall } from 'src/features/ledgerEvent/ledgerEventApiCalls';
import { ledgerEventLabel } from 'src/features/ledgerEvent/ledgerEventLabel';
import { LedgerEventWithRelationships } from 'src/features/ledgerEvent/ledgerEventSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function LedgerEventEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [ledgerEvent, setLedgerEvent] = useState<LedgerEventWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setLedgerEvent(undefined);
        const ledgerEvent = await ledgerEventFindApiCall(id);

        if (!ledgerEvent) {
          router.push('/ledger-event');
        }

        setLedgerEvent(ledgerEvent);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/ledger-event');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!ledgerEvent) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.ledgerEvent.list.menu, '/ledger-event'],
          [ledgerEventLabel(ledgerEvent, context.dictionary), `/ledger-event/${ledgerEvent?.id}`],
          [dictionary.ledgerEvent.edit.menu],
        ]}
      />
      <div className="my-10">
        <LedgerEventForm
          context={context}
          ledgerEvent={ledgerEvent}
          onSuccess={(ledgerEvent: LedgerEvent) => router.push(`/ledger-event/${ledgerEvent.id}`)}
          onCancel={() => router.push('/ledger-event')}
        />
      </div>
    </div>
  );
}
