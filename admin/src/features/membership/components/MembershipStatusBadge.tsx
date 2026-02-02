import { Membership } from '@prisma/client';
import { Badge } from 'src/shared/components/ui/badge';
import { AppContext } from 'src/shared/controller/appContext';

export function MembershipStatusBadge({
  membership,
  context,
}: {
  membership: Membership;
  context: AppContext;
}) {
  const status = membership?.status;

  if (status === 'active') {
    return (
      <Badge className="bg-green-500 hover:bg-green-500/80 dark:bg-green-900 dark:text-green-100">
        {context.dictionary.membership.enumerators.status.active}
      </Badge>
    );
  }

  if (status === 'invited') {
    return (
      <Badge className="bg-yellow-500 hover:bg-yellow-500/80 dark:bg-yellow-900 dark:text-yellow-100">
        {context.dictionary.membership.enumerators.status.invited}
      </Badge>
    );
  }

  if (status === 'disabled') {
    return (
      <Badge variant={'destructive'}>
        {context.dictionary.membership.enumerators.status.disabled}
      </Badge>
    );
  }

  return null;
}
