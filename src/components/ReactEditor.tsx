import { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { SandpackStatusMonitor } from './SandpackStatusMonitor';
import { SplitDivider } from './SplitDivider';
import { processReactCode } from '../lib/sandpack';
import { detectDependencies } from '../lib/detectDependencies';
import { useSplitPane } from '../hooks/useSplitPane';

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

function useDependencies(code: string) {
  const dependencies = useMemo(() => detectDependencies(code), [code]);
  const prevFingerprintRef = useRef('');
  const [depsKey, setDepsKey] = useState(0);

  useEffect(() => {
    const fingerprint = Object.keys(dependencies).sort().join(',');
    if (prevFingerprintRef.current && prevFingerprintRef.current !== fingerprint) {
      setDepsKey((k) => k + 1);
    }
    prevFingerprintRef.current = fingerprint;
  }, [dependencies]);

  return { dependencies, depsKey };
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
  const [liveCode, setLiveCode] = useState(processedCode);
  const { dependencies, depsKey } = useDependencies(liveCode);
  const { containerRef, codeVisible, leftWidth, rightWidth, handleMouseDown, toggleCode } =
    useSplitPane();

  useEffect(() => {
    setLiveCode(processedCode);
  }, [processedCode]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setLiveCode(newCode);
      onCodeChange(newCode);
    },
    [onCodeChange]
  );

  return (
    <div
      className={`editor-content editor-content-react tab-${activeTab}`}
      ref={containerRef}
      style={{
        '--split-left': leftWidth,
        '--split-right': rightWidth,
      } as React.CSSProperties}
    >
      <SandpackProvider
        key={`${refreshKey}-${depsKey}`}
        template="react-ts"
        files={{
          '/App.tsx': liveCode,
        }}
        customSetup={{
          dependencies,
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
          />
          <SandpackPreview
            showNavigator={false}
            showRefreshButton={false}
            showOpenInCodeSandbox={false}
          />
        </SandpackLayout>
        <SandpackSyncCode
          initialCode={liveCode}
          onCodeChange={handleCodeChange}
        />
        <SandpackStatusMonitor onStatusChange={onLoadingChange} />
      </SandpackProvider>
      <SplitDivider
        codeVisible={codeVisible}
        onMouseDown={handleMouseDown}
        onToggle={toggleCode}
      />
    </div>
  );
}
