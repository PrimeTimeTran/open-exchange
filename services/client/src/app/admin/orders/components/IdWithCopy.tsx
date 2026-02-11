'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function IdWithCopy({
  id,
  truncateLength = 8,
}: {
  id: string;
  truncateLength?: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayId =
    id.length > truncateLength ? `${id.substring(0, truncateLength)}...` : id;

  return (
    <div className="flex items-center space-x-1 group">
      <span className="font-mono text-xs" title={id}>
        {displayId}
      </span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
        title="Copy ID"
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}
