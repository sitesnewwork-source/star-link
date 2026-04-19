import { useEffect, useRef, useState } from "react";

/**
 * Animates a numeric value from 0 to `target` over `duration` ms using requestAnimationFrame.
 * Re-runs whenever `target` changes.
 */
export const useCountUp = (target: number, duration = 1200) => {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!Number.isFinite(target) || target <= 0) {
      setValue(target || 0);
      return;
    }
    const start = performance.now();
    // easeOutCubic for a smooth slow-down
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      setValue(target * ease(t));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
};
