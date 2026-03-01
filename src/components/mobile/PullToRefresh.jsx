import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const pullY = useMotionValue(0);
  const opacity = useTransform(pullY, [0, THRESHOLD], [0, 1]);
  const rotate = useTransform(pullY, [0, THRESHOLD], [0, 180]);
  const scale = useTransform(pullY, [0, THRESHOLD], [0.5, 1]);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0 && window.scrollY === 0) {
      pullY.set(Math.min(delta * 0.5, THRESHOLD));
    }
  }, [refreshing, pullY]);

  const handleTouchEnd = useCallback(async () => {
    if (startY.current === null) return;
    startY.current = null;
    if (pullY.get() >= THRESHOLD - 4 && !refreshing) {
      setRefreshing(true);
      pullY.set(THRESHOLD);
      await onRefresh?.();
      setRefreshing(false);
    }
    pullY.set(0);
  }, [pullY, refreshing, onRefresh]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ position: "relative" }}
    >
      {/* Indicator */}
      <motion.div
        style={{ opacity, scaleX: scale, scaleY: scale }}
        className="flex items-center justify-center absolute left-0 right-0 z-40 pointer-events-none"
        initial={{ top: -40 }}
      >
        <div className="bg-background border border-border rounded-full p-2 shadow-md">
          <motion.div style={{ rotate }}>
            <RefreshCw
              className={`w-5 h-5 text-primary ${refreshing ? "animate-spin" : ""}`}
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.div style={{ y: refreshing ? THRESHOLD / 2 : pullY }}>
        {children}
      </motion.div>
    </div>
  );
}