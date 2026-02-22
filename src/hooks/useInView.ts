import { useState, useEffect } from 'react';

interface UseInViewOptions {
  /** Expand/contract the root's bounding box for intersection tests. Default: '100px'. */
  rootMargin?: string;
  threshold?: number;
  /**
   * When true the hook returns `true` permanently once the element has been seen —
   * useful for one-time lazy-load triggers.
   * When false (default) the value tracks live visibility, allowing the caller
   * to unmount heavy content when it scrolls off screen.
   */
  sticky?: boolean;
}

export function useInView(
  ref: React.RefObject<HTMLElement | null>,
  { rootMargin = '100px', threshold, sticky = false }: UseInViewOptions = {}
) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (sticky) {
          if (entry.isIntersecting) setIsInView(true);
        } else {
          setIsInView(entry.isIntersecting);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, sticky]);

  return isInView;
}
