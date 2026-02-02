import Link from 'src/shared/components/Link';
import { LuPlus } from 'react-icons/lu';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { Button } from 'src/shared/components/ui/button';
import { AppContext } from 'src/shared/controller/appContext';

export function WithdrawalNewButton({ context }: { context: AppContext }) {
  if (!hasPermission(permissions.withdrawalCreate, context)) {
    return null;
  }

  return (
    <Button asChild>
      <Link href="/withdrawal/new" prefetch={false}>
        <LuPlus className="mr-2 h-4 w-4" /> {context.dictionary.withdrawal.new.menu}
      </Link>
    </Button>
  );
}
