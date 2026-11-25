import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router doesn't scroll on navigation by itself. This makes links like
 * /#plan land on the right section, and sends normal page changes to the top.
 */
export function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait a tick so the target section has rendered after a route change.
      const id = decodeURIComponent(hash.slice(1));
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      return () => clearTimeout(timer);
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return null;
}
