import { ApiKey } from '@prisma/client';
import { sortBy, startCase } from 'lodash';
import { Badge } from 'src/shared/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/shared/components/ui/tooltip';

export function ApiKeyScopesBadge({ apiKey }: { apiKey: ApiKey }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Badge>{apiKey?.scopes?.length || 0}</Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-left">
            {sortBy(apiKey?.scopes)?.map((scope) => {
              return <div key={scope}>{startCase(scope)}</div>;
            })}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
