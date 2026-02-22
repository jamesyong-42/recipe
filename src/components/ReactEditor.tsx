import { useMemo, useEffect, useRef } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { SandpackStatusMonitor } from './SandpackStatusMonitor';
import { SANDPACK_DEPENDENCIES, processReactCode } from '../lib/sandpack';

function SandpackSyncCode({
  initialCode,
  onCodeChange,
}: {
  initialCode: string;
  onCodeChange: (code: string) => void;
}) {
  const { sandpack } = useSandpack();
  const code = sandpack.files['/App.tsx']?.code || '';
  const hasUserEdited = useRef(false);
  const lastSyncedCode = useRef(initialCode);

  useEffect(() => {
    // Skip if code matches initial or last synced code (no real change)
    if (code === initialCode || code === lastSyncedCode.current) {
      return;
    }

    hasUserEdited.current = true;

    const timer = setTimeout(() => {
      if (hasUserEdited.current && code !== lastSyncedCode.current) {
        lastSyncedCode.current = code;
        onCodeChange(code);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [code, initialCode, onCodeChange]);

  return null;
}

export function ReactEditor({
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
  const processedCode = useMemo(() => processReactCode(code), [code]);

  return (
    <div className={`editor-content editor-content-react tab-${activeTab}`}>
      <SandpackProvider
        key={refreshKey}
        template="react-ts"
        files={{
          '/App.tsx': processedCode,
        }}
        customSetup={{
          dependencies: SANDPACK_DEPENDENCIES,
        }}
        options={{
          externalResources: ['https://cdn.tailwindcss.com'],
          recompileMode: 'delayed',
          recompileDelay: 500,
        }}
      >
        <SandpackLayout>
          <SandpackCodeEditor
            showLineNumbers
            showTabs={false}
            style={{ flex: 1, minWidth: '50%' }}
          />
          <SandpackPreview
            showNavigator={false}
            showRefreshButton={false}
            showOpenInCodeSandbox={false}
            style={{ flex: 1, minWidth: '50%' }}
          />
        </SandpackLayout>
        <SandpackSyncCode
          initialCode={processedCode}
          onCodeChange={onCodeChange}
        />
        <SandpackStatusMonitor onStatusChange={onLoadingChange} />
      </SandpackProvider>
    </div>
  );
}
