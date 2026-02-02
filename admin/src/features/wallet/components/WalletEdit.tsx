'use client';

import { Wallet } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { WalletForm } from 'src/features/wallet/components/WalletForm';
import { walletFindApiCall } from 'src/features/wallet/walletApiCalls';
import { walletLabel } from 'src/features/wallet/walletLabel';
import { WalletWithRelationships } from 'src/features/wallet/walletSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function WalletEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setWallet(undefined);
        const wallet = await walletFindApiCall(id);

        if (!wallet) {
          router.push('/wallet');
        }

        setWallet(wallet);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/wallet');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!wallet) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.wallet.list.menu, '/wallet'],
          [walletLabel(wallet, context.dictionary), `/wallet/${wallet?.id}`],
          [dictionary.wallet.edit.menu],
        ]}
      />
      <div className="my-10">
        <WalletForm
          context={context}
          wallet={wallet}
          onSuccess={(wallet: Wallet) => router.push(`/wallet/${wallet.id}`)}
          onCancel={() => router.push('/wallet')}
        />
      </div>
    </div>
  );
}
