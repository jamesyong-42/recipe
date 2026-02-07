import { useEffect } from 'react';
import { useSandpack } from '@codesandbox/sandpack-react';

export function SandpackStatusMonitor({
  onStatusChange,
}: {
  onStatusChange?: (loading: boolean) => void;
}) {
  const { sandpack, listen } = useSandpack();

  useEffect(() => {
    // Reset when sandpack restarts
    if (sandpack.status !== 'running') {
      onStatusChange?.(true);
      return;
    }

    // Listen for bundler messages to detect when preview is truly ready
    const unsubscribe = listen((message) => {
      // 'done' message indicates bundling is complete and preview should be rendered
      if (message.type === 'done') {
        onStatusChange?.(false);
      }
      // Also handle 'start' to re-trigger loading on recompile
      if (message.type === 'start') {
        onStatusChange?.(true);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [sandpack.status, listen, onStatusChange]);

  return null;
}
