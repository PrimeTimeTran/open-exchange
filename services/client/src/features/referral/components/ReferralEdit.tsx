'use client';

import { Referral } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReferralForm } from 'src/features/referral/components/ReferralForm';
import { referralFindApiCall } from 'src/features/referral/referralApiCalls';
import { referralLabel } from 'src/features/referral/referralLabel';
import { ReferralWithRelationships } from 'src/features/referral/referralSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function ReferralEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [referral, setReferral] = useState<ReferralWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setReferral(undefined);
        const referral = await referralFindApiCall(id);

        if (!referral) {
          router.push('/referral');
        }

        setReferral(referral);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/referral');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!referral) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.referral.list.menu, '/referral'],
          [referralLabel(referral, context.dictionary), `/referral/${referral?.id}`],
          [dictionary.referral.edit.menu],
        ]}
      />
      <div className="my-10">
        <ReferralForm
          context={context}
          referral={referral}
          onSuccess={(referral: Referral) => router.push(`/referral/${referral.id}`)}
          onCancel={() => router.push('/referral')}
        />
      </div>
    </div>
  );
}
