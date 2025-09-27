import { useEffect, useMemo } from "react";
import { debounce, throttle } from "lodash";

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
