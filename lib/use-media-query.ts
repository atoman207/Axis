import { useCallback, useSyncExternalStore } from "react";

/**
 * Live `matchMedia` result. The server (and the first hydration pass) sees
 * `serverValue`, then the real value takes over without a hydration mismatch.
 */
export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue
  );
}
