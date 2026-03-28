import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSplitPaneOptions {
  defaultPercent?: number;
  minPercent?: number;
  maxPercent?: number;
}

export function useSplitPane({
  defaultPercent = 50,
  minPercent = 20,
  maxPercent = 80,
}: UseSplitPaneOptions = {}) {
  const [splitPercent, setSplitPercent] = useState(defaultPercent);
  const [codeVisible, setCodeVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lastVisiblePercent = useRef(defaultPercent);

  // Keep track of last visible split for restore
  useEffect(() => {
    if (codeVisible && splitPercent > 0) {
      lastVisiblePercent.current = splitPercent;
    }
  }, [splitPercent, codeVisible]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(maxPercent, Math.max(minPercent, percent));
      setSplitPercent(clamped);
      if (!codeVisible) setCodeVisible(true);
    };

    const handleMouseUp = () => {
      if (dragging.current) {
        dragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [codeVisible, minPercent, maxPercent]);

  const toggleCode = useCallback(() => {
    setCodeVisible((v) => !v);
  }, []);

  const leftWidth = codeVisible ? `${splitPercent}%` : '0%';
  const rightWidth = codeVisible ? `${100 - splitPercent}%` : '100%';

  return {
    containerRef,
    splitPercent,
    codeVisible,
    leftWidth,
    rightWidth,
    handleMouseDown,
    toggleCode,
  };
}
