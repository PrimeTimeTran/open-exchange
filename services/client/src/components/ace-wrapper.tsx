'use client';

import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/ext-language_tools';

interface AceWrapperProps {
  code: string;
  language: string;
}

export default function AceWrapper({ code, language }: AceWrapperProps) {
  return (
    <AceEditor
      value={code}
      width="100%"
      fontSize={14}
      mode={language}
      theme="monokai"
      readOnly={true}
      showGutter={false}
      maxLines={Infinity}
      showPrintMargin={false}
      highlightActiveLine={false}
      className="bg-transparent!"
      style={{ backgroundColor: 'transparent' }}
      name={`code-window-${Math.random().toString(36).substring(7)}`}
      setOptions={{
        tabSize: 2,
        useWorker: false,
        fontFamily: 'monospace',
        displayIndentGuides: false,
      }}
    />
  );
}
