import { useState, useEffect, useCallback, useRef } from 'react';

const MAX_CONCURRENT = 2;

// Shared module-level state
let activeCount = 0;
const waitingQueue: Array<() => void> = [];

function requestSlot(): Promise<void> {
  if (activeCount < MAX_CONCURRENT) {
    activeCount++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    waitingQueue.push(() => {
      activeCount++;
      resolve();
    });
  });
}

function releaseSlot() {
  if (activeCount > 0) activeCount--;
  if (waitingQueue.length > 0 && activeCount < MAX_CONCURRENT) {
    const next = waitingQueue.shift()!;
    next();
  }
}

/**
 * Queue hook that limits how many Sandpack previews render concurrently.
 * Returns `true` when this component has been granted a render slot.
 * Call `release()` after loading so the next card can start rendering.
 */
export function useRenderQueue(enabled: boolean) {
  const [hasSlot, setHasSlot] = useState(false);
  // Ref tracks actual slot ownership to avoid stale closure issues in cleanup
  const acquiredRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      // Release any held slot and unmount the preview
      if (acquiredRef.current) {
        acquiredRef.current = false;
        releaseSlot();
      }
      setHasSlot(false);
      return;
    }

    let cancelled = false;

    requestSlot().then(() => {
      if (!cancelled) {
        acquiredRef.current = true;
        setHasSlot(true);
      } else {
        // Component disabled while waiting in queue — give slot back
        releaseSlot();
      }
    });

    return () => {
      cancelled = true;
      if (acquiredRef.current) {
        acquiredRef.current = false;
        releaseSlot();
      }
    };
  }, [enabled]);

  // Called after loading completes: release the throttling slot but keep rendering
  const release = useCallback(() => {
    if (acquiredRef.current) {
      acquiredRef.current = false;
      releaseSlot();
    }
  }, []);

  return { hasSlot, release };
}
