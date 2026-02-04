'use client';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import { LuCopy } from 'react-icons/lu';
import { toast } from 'src/shared/components/ui/use-toast';
import { Dictionary } from 'src/translation/locales';

export function CopyToClipboardButton({
  text,
  dictionary,
}: {
  text: string | null | undefined;
  dictionary: Dictionary;
}) {
  if (!text) {
    return null;
  }

  return (
    <CopyToClipboard
      text={text}
      onCopy={() =>
        toast({
          title: dictionary.shared.copiedToClipboard,
        })
      }
    >
      <button className="inline-flex text-muted-foreground">
        <LuCopy />
      </button>
    </CopyToClipboard>
  );
}
