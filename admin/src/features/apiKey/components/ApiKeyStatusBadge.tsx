import { ApiKey, Membership } from '@prisma/client';
import dayjs from 'dayjs';
import { sortBy } from 'lodash';
import { Badge } from 'src/shared/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/shared/components/ui/tooltip';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { formatTranslation } from 'src/translation/formatTranslation';

export function ApiKeyStatusBadge({
  apiKey,
  context,
}: {
  apiKey: ApiKey;
  context: AppContext;
}) {
  const status = apiKey?.disabledAt
    ? 'disabled'
    : dayjs(apiKey.expiresAt).isBefore(new Date())
    ? 'expired'
    : 'active';

  const label = enumeratorLabel(
    context.dictionary.apiKey.enumerators.status,
    status,
  );

  if (status === 'active') {
    return (
      <Badge className="bg-green-500 hover:bg-green-500/80 dark:bg-green-900 dark:text-green-100">
        {label}
      </Badge>
    );
  }

  if (status === 'disabled') {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Badge variant={'destructive'}>{label}</Badge>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div>
              {formatTranslation(
                context.dictionary.apiKey.disabledTooltip,
                formatDatetime(apiKey.disabledAt, context.dictionary),
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (status === 'expired') {
    return <Badge>{label}</Badge>;
  }

  return null;
}
