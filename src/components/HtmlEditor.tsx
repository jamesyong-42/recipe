import { useState, useCallback, useMemo, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { generateHtmlDocument } from '../lib/sandpack';

export function HtmlEditor({
  code,
  onCodeChange,
  refreshKey,
  onLoadingChange,
  activeTab = 'code',
}: {
  code: string;
  onCodeChange: (code: string) => void;
  refreshKey: number;
  onLoadingChange: (loading: boolean) => void;
  activeTab?: 'code' | 'preview';
}) {
  const [localCode, setLocalCode] = useState(code);

  // Set loading when refreshKey changes
  useEffect(() => {
    onLoadingChange(true);
  }, [refreshKey, onLoadingChange]);

  const handleChange = useCallback(
    (value: string | undefined) => {
      const newCode = value || '';
      setLocalCode(newCode);
      onCodeChange(newCode);
    },
    [onCodeChange]
  );

  const handleIframeLoad = useCallback(() => {
    onLoadingChange(false);
  }, [onLoadingChange]);

  const srcDoc = useMemo(() => generateHtmlDocument(localCode), [localCode]);

  return (
    <div className={`editor-content editor-content-html tab-${activeTab}`}>
      <div className="editor-pane">
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="html"
          value={localCode}
          onChange={handleChange}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
      <div className="preview-pane">
        <iframe
          key={refreshKey}
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          title="HTML Preview"
          onLoad={handleIframeLoad}
          style={{ border: 'none', width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
