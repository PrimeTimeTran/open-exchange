'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const AceWrapper = dynamic(() => import('./ace-wrapper'), {
  ssr: false,
  loading: () => null,
});

interface CodeWindowProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeWindow({
  code,
  language = 'typescript',
  filename = 'example.ts',
}: CodeWindowProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative bg-background/50 rounded-xl border border-white/10 shadow-2xl overflow-hidden group">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="text-xs text-white/40 font-mono ml-2">{filename}</div>
      </div>
      <div className="relative p-4">
        {mounted ? (
          <AceWrapper code={code} language={language || 'typescript'} />
        ) : (
          <pre className="font-mono text-sm leading-relaxed text-gray-300">
            {code}
          </pre>
        )}
      </div>
    </div>
  );
}
