import { useEffect, useRef } from "react";

export function useAutoScroll<T>(dependencies: T[]) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dependencies.length > 0 && ref.current) {
      ref.current.scrollIntoView({ 
        behavior: "smooth",
        block: "center"
      });
    }
  }, [dependencies]);

  return ref;
}
