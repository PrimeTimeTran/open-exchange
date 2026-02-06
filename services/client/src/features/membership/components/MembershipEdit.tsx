'use client';

import { Membership } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MembershipEditForm } from 'src/features/membership/components/MembershipEditForm';
import { membershipFindApiCall } from 'src/features/membership/membershipApiCalls';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { MembershipWithUser } from 'src/features/membership/membershipSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function MembershipEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [membership, setMembership] = useState<MembershipWithUser>();

  useEffect(() => {
    async function doFetch() {
      try {
        setMembership(undefined);
        const membership = await membershipFindApiCall(id);

        if (!membership) {
          router.push('/membership');
        }

        setMembership(membership);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/membership');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!membership) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.membership.list.menu, '/membership'],
          [
            membershipLabel(membership, context.dictionary),
            `/membership/${membership?.id}`,
          ],
          [dictionary.membership.edit.menu],
        ]}
      />
      <div className="my-10">
        <MembershipEditForm
          context={context}
          membership={membership}
          onSuccess={(membership: Membership) =>
            router.push(`/membership/${membership.id}`)
          }
          onCancel={() => router.push('/membership')}
        />
      </div>
    </div>
  );
}
