import { useMemo, useEffect, useCallback } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview as SandpackPreviewPane,
} from '@codesandbox/sandpack-react';
import { SandpackStatusMonitor } from './SandpackStatusMonitor';
import {
  SANDPACK_DEPENDENCIES,
  processReactCode,
  generateHtmlDocument,
} from '../lib/sandpack';
import type { SnippetType } from '../types';

interface SnippetPreviewProps {
  code: string;
  type: SnippetType;
  className?: string;
  onLoadingChange?: (loading: boolean) => void;
}

function HtmlPreview({
  code,
  onLoadingChange,
}: {
  code: string;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const srcDoc = useMemo(() => generateHtmlDocument(code), [code]);

  useEffect(() => {
    onLoadingChange?.(true);
  }, [code, onLoadingChange]);

  const handleLoad = useCallback(() => {
    onLoadingChange?.(false);
  }, [onLoadingChange]);

  return (
    <iframe
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      title="HTML Preview"
      onLoad={handleLoad}
      style={{ border: 'none', width: '100%', height: '100%' }}
    />
  );
}

function ReactPreview({
  code,
  onLoadingChange,
}: {
  code: string;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const processedCode = useMemo(() => processReactCode(code), [code]);

  return (
    <SandpackProvider
      template="react-ts"
      files={{
        '/App.tsx': processedCode,
      }}
      customSetup={{
        dependencies: SANDPACK_DEPENDENCIES,
      }}
      options={{
        externalResources: [
          'https://cdn.tailwindcss.com',
          'https://fonts.googleapis.com',
        ],
      }}
    >
      <SandpackLayout>
        <SandpackPreviewPane
          showNavigator={false}
          showRefreshButton={false}
          showOpenInCodeSandbox={false}
        />
      </SandpackLayout>
      <SandpackStatusMonitor onStatusChange={onLoadingChange} />
    </SandpackProvider>
  );
}

export function SnippetPreview({
  code,
  type,
  className = '',
  onLoadingChange,
}: SnippetPreviewProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      {type === 'html' ? (
        <HtmlPreview code={code} onLoadingChange={onLoadingChange} />
      ) : (
        <ReactPreview code={code} onLoadingChange={onLoadingChange} />
      )}
    </div>
  );
}
