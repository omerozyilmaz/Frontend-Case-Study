import { useCallback, useRef } from "react";

export function useThrottledCallback<T extends unknown[]>(
  callback: (...args: T) => void,
  wait = 500,
): (...args: T) => void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const lastRunRef = useRef(0);

  return useCallback(
    (...args: T) => {
      const now = Date.now();
      if (now - lastRunRef.current < wait) return;
      lastRunRef.current = now;
      callbackRef.current(...args);
    },
    [wait],
  );
}
