'use client'

import React, { useEffect, useState } from 'react'
import AceEditor from 'react-ace'
import { Loader2, Copy, Check } from 'lucide-react'

// Import Ace builds to avoid issues with Next.js SSR
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/theme-tomorrow'
import 'ace-builds/src-noconflict/ext-language_tools'

interface CodeEditorProps {
  initialCode?: string
  language?: string
  theme?: string
  height?: string
  readOnly?: boolean
}

export function CodeEditor({
  initialCode = '',
  language = 'javascript',
  theme = 'monokai',
  height = '300px',
  readOnly = false,
}: CodeEditorProps) {
  const [mounted, setMounted] = useState(false)
  const [code, setCode] = useState(initialCode)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!mounted) {
    return (
      <div
        className='w-full bg-surface-variant/10 border border-outline-variant rounded-md flex items-center justify-center text-on-surface-variant'
        style={{ height }}
      >
        <Loader2 className='w-6 h-6 animate-spin' />
      </div>
    )
  }

  return (
    <div className='my-6 border border-outline-variant rounded-md overflow-hidden shadow-sm'>
      <div className='bg-surface-variant/30 px-4 py-2 border-b border-outline-variant flex justify-between items-center'>
        <span className='text-xs font-medium text-on-surface-variant uppercase tracking-wider'>
          {language}
        </span>
        <div className='flex items-center gap-3'>
          <span className='text-xs text-on-surface-variant/70'>
            {readOnly ? 'Read Only' : 'Editable'}
          </span>
          <button
            onClick={handleCopy}
            className='p-1 hover:text-primary text-on-surface-variant transition-colors'
            title='Copy code'
          >
            {copied ? (
              <Check className='w-4 h-4 text-success' />
            ) : (
              <Copy className='w-4 h-4' />
            )}
          </button>
        </div>
      </div>
      <AceEditor
        mode={language}
        theme={theme}
        onChange={setCode}
        name={`editor-${Math.random().toString(36).substring(7)}`}
        editorProps={{ $blockScrolling: true }}
        value={code}
        width='100%'
        height={height}
        readOnly={readOnly}
        fontSize={14}
        setOptions={{
          showLineNumbers: true,
          tabSize: 2,
          useWorker: false, // Disable web workers to avoid path issues in Next.js
        }}
        className='bg-background'
      />
    </div>
  )
}
