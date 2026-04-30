import type { MotionState } from "../types";

export function createMotionTokens(motion: MotionState) {
  return {
    "--motion-delay": `${motion.delay}ms`,
    "--motion-distance": `${motion.distance}px`,
    "--motion-duration": `${motion.duration}ms`,
    "--motion-ease": motion.ease,
    "--motion-stagger": `${motion.stagger}ms`
  };
}
