'use client';
import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function AnimatedNumber({ value, duration = 700, className, style }: Props) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef  = useRef(value);
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    const from = prevRef.current;
    if (from === value) return;

    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplayed(Math.round(from + (value - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else prevRef.current = value;
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span className={className} style={style}>
      {displayed.toLocaleString()}
    </span>
  );
}
