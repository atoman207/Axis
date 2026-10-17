import { useSyncExternalStore } from "react";

let supported: boolean | undefined;

/**
 * Whether this browser can create a WebGL context at all (old devices, blocked GPUs
 * and locked-down browsers can't). Probed once, then cached; the probe context is
 * released straight away.
 */
export function hasWebGL() {
  if (supported !== undefined) return supported;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    supported = gl !== null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    supported = false;
  }
  return supported;
}

const subscribe = () => () => {};

/**
 * WebGL support as a hook: false on the server and during hydration, then the real
 * answer — so 3D scenes are only mounted where they can actually start
 * (react-three-fiber otherwise leaves an unhandled rejection behind).
 */
export function useWebGLSupport() {
  return useSyncExternalStore(subscribe, hasWebGL, () => false);
}
