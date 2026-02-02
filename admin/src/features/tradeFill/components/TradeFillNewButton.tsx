import Link from 'src/shared/components/Link';
import { LuPlus } from 'react-icons/lu';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { Button } from 'src/shared/components/ui/button';
import { AppContext } from 'src/shared/controller/appContext';

export function TradeFillNewButton({ context }: { context: AppContext }) {
  if (!hasPermission(permissions.tradeFillCreate, context)) {
    return null;
  }

  return (
    <Button asChild>
      <Link href="/trade-fill/new" prefetch={false}>
        <LuPlus className="mr-2 h-4 w-4" /> {context.dictionary.tradeFill.new.menu}
      </Link>
    </Button>
  );
}
