import { useState } from 'react';
import { LuFile, LuPause, LuPlay, LuSaveAll, LuTrash } from 'react-icons/lu';
import { ConfirmDialog } from 'src/shared/components/ConfirmDialog';
import { Button } from 'src/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/shared/components/ui/tooltip';
import { importerOutputSchema } from 'src/shared/schemas/importerSchemas';
import { Dictionary } from 'src/translation/locales';
import { z } from 'zod';

export function ImporterToolbar({
  dictionary,
  state,
  doStart,
  doPause,
  doNew,
  rows,
}: {
  rows: z.infer<typeof importerOutputSchema>;
  dictionary: Dictionary;
  state: 'idle' | 'importing' | 'paused' | 'completed';
  doStart: () => void;
  doPause: () => void;
  doNew: () => void;
}) {
  const [newConfirmVisible, setNewConfirmVisible] = useState(false);
  const [discardConfirmVisible, setDiscardConfirmVisible] = useState(false);

  const isOnlyErrorRows =
    rows.every((row) => row._status === 'error') && state === 'idle';
  const showStart =
    !isOnlyErrorRows && (state === 'idle' || state === 'paused');
  const showDiscard = state === 'idle' || state === 'paused';
  const showNew = state === 'completed';
  const showPause = state === 'importing';

  return (
    <div className="flex gap-2">
      {isOnlyErrorRows && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button className="cursor-none" disabled>
                  <LuPlay className="mr-2 h-4 w-4" />
                  {dictionary.shared.import}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-destructive">
                {dictionary.shared.importer.noValidRows}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {showStart && (
        <Button onClick={doStart}>
          <LuPlay className="mr-2 h-4 w-4" />
          {dictionary.shared.import}
        </Button>
      )}

      {showPause && (
        <Button variant="secondary" onClick={doPause}>
          <LuPause className="mr-2 h-4 w-4" />
          {dictionary.shared.pause}
        </Button>
      )}

      {showDiscard && (
        <Button
          variant="secondary"
          onClick={() => setDiscardConfirmVisible(true)}
        >
          <LuTrash className="mr-2 h-4 w-4" /> {dictionary.shared.discard}
        </Button>
      )}

      {showNew && (
        <Button variant="secondary" onClick={() => setNewConfirmVisible(true)}>
          <LuFile className="mr-2 h-4 w-4" /> {dictionary.shared.new}
        </Button>
      )}

      {discardConfirmVisible && (
        <ConfirmDialog
          title={dictionary.shared.importer.list.discardConfirm}
          onConfirm={() => {
            setDiscardConfirmVisible(false);
            doNew();
          }}
          onCancel={() => setDiscardConfirmVisible(false)}
          confirmText={dictionary.shared.yes}
          cancelText={dictionary.shared.no}
        />
      )}

      {newConfirmVisible && (
        <ConfirmDialog
          title={dictionary.shared.importer.list.newConfirm}
          onConfirm={() => {
            setNewConfirmVisible(false);
            doNew();
          }}
          onCancel={() => setNewConfirmVisible(false)}
          confirmText={dictionary.shared.yes}
          cancelText={dictionary.shared.no}
        />
      )}
    </div>
  );
}
