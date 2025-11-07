import { useEffect, useState, RefObject } from "react";

interface CanvasSize {
  width: number;
  height: number;
}

export const useCanvas = (canvasRef: RefObject<HTMLCanvasElement>) => {
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 800, height: 600 });

  useEffect(() => {
    if (!canvasRef.current) return;

    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Set the actual size in memory (scaled for high DPI displays)
      const width = rect.width * dpr;
      const height = rect.height * dpr;

      canvas.width = width;
      canvas.height = height;

      // Scale back down using CSS
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';

      // Scale the drawing context so everything draws at the correct size
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      setCanvasSize({ width: rect.width, height: rect.height });
    };

    // Initial size update
    updateCanvasSize();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    
    if (canvasRef.current?.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [canvasRef]);

  return { canvasSize };
};
