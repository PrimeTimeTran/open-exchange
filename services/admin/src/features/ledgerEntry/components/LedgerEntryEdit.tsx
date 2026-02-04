'use client';

import { LedgerEntry } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LedgerEntryForm } from 'src/features/ledgerEntry/components/LedgerEntryForm';
import { ledgerEntryFindApiCall } from 'src/features/ledgerEntry/ledgerEntryApiCalls';
import { ledgerEntryLabel } from 'src/features/ledgerEntry/ledgerEntryLabel';
import { LedgerEntryWithRelationships } from 'src/features/ledgerEntry/ledgerEntrySchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function LedgerEntryEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [ledgerEntry, setLedgerEntry] = useState<LedgerEntryWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setLedgerEntry(undefined);
        const ledgerEntry = await ledgerEntryFindApiCall(id);

        if (!ledgerEntry) {
          router.push('/ledger-entry');
        }

        setLedgerEntry(ledgerEntry);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/ledger-entry');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!ledgerEntry) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.ledgerEntry.list.menu, '/ledger-entry'],
          [ledgerEntryLabel(ledgerEntry, context.dictionary), `/ledger-entry/${ledgerEntry?.id}`],
          [dictionary.ledgerEntry.edit.menu],
        ]}
      />
      <div className="my-10">
        <LedgerEntryForm
          context={context}
          ledgerEntry={ledgerEntry}
          onSuccess={(ledgerEntry: LedgerEntry) => router.push(`/ledger-entry/${ledgerEntry.id}`)}
          onCancel={() => router.push('/ledger-entry')}
        />
      </div>
    </div>
  );
}
