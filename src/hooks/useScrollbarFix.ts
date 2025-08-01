import { useEffect } from 'react';

export const useScrollbarFix = () => {
  useEffect(() => {
    // Simple function to ensure scrollbar is visible
    const ensureScrollbar = () => {
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflowY = 'scroll';
      }
    };

    // Watch for style changes
    const observer = new MutationObserver(() => {
      setTimeout(ensureScrollbar, 0);
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style']
    });

    // Initial check
    ensureScrollbar();

    return () => observer.disconnect();
  }, []);
}; 