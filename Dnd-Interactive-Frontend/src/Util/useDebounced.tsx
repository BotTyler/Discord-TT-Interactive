import { throttle } from "lodash";
import { useEffect, useMemo } from "react";

export default function useDebounced(callback: (...args: any[]) => void, delay: number) {
  const debounced = useMemo(
    () => throttle(callback, delay),
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      debounced.cancel(); // cleanup on unmount
    };
  }, [debounced]);

  return debounced;
}
