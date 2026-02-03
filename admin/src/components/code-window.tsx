'use client'

import AceEditor from 'react-ace'
import { useEffect, useState } from 'react'

import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/mode-typescript'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/ext-language_tools'

interface CodeWindowProps {
  code: string
  language?: string
  filename?: string
}

export function CodeWindow({
  code,
  language = 'typescript',
  filename = 'example.ts',
}: CodeWindowProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className='relative bg-[#1e1e1e] rounded-xl border border-white/10 shadow-2xl overflow-hidden group'>
      <div className='flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5'>
        <div className='flex gap-1.5'>
          <div className='w-3 h-3 rounded-full bg-[#ff5f56]' />
          <div className='w-3 h-3 rounded-full bg-[#ffbd2e]' />
          <div className='w-3 h-3 rounded-full bg-[#27c93f]' />
        </div>
        <div className='text-xs text-white/40 font-mono ml-2'>{filename}</div>
      </div>
      <div className='relative p-4'>
        {mounted ? (
          <AceEditor
            value={code}
            width='100%'
            fontSize={14}
            mode={language}
            theme='monokai'
            readOnly={true}
            showGutter={false}
            maxLines={Infinity}
            showPrintMargin={false}
            highlightActiveLine={false}
            className='!bg-transparent'
            style={{ backgroundColor: 'transparent' }}
            name={`code-window-${Math.random().toString(36).substring(7)}`}
            setOptions={{
              tabSize: 2,
              useWorker: false,
              fontFamily: 'monospace',
              displayIndentGuides: false,
            }}
          />
        ) : (
          <pre className='font-mono text-sm leading-relaxed text-gray-300'>
            {code}
          </pre>
        )}
      </div>
    </div>
  )
}
