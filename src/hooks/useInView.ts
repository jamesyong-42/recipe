import { useState, useEffect } from 'react';

export function useInView(
  ref: React.RefObject<HTMLElement | null>,
  options?: IntersectionObserverInit
) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Once visible, stay visible (don't unload)
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { rootMargin: '100px', ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options]);

  return isInView;
}
