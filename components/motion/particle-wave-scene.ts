import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

export type ParticleWaveHandle = {
  /** Run or pause the render loop (off-screen, hidden tab). */
  setActive: (active: boolean) => void;
  destroy: () => void;
};

type Options = {
  /** Draw one still frame and never animate. */
  still: boolean;
};

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute float aSeed;
  varying float vFade;
  varying float vMix;
  varying float vCrest;

  void main() {
    vec3 p = position;
    float t = uTime;
    float lift =
        sin(p.x * 0.38 + t * 0.85) * 0.42
      + cos(p.z * 0.52 + t * 0.62) * 0.32
      + sin((p.x + p.z) * 0.22 + t * 0.45) * 0.26;
    p.y += lift;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.6 + aSeed * 0.8) * (9.0 / -mv.z);

    vFade = 1.0 - clamp((-mv.z - 5.0) / 20.0, 0.0, 1.0);
    vMix = clamp(p.x / 30.0 + 0.5, 0.0, 1.0);
    vCrest = smoothstep(0.35, 0.95, lift);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uBlue;
  uniform vec3 uViolet;
  uniform vec3 uWhite;
  varying float vFade;
  varying float vMix;
  varying float vCrest;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.05, d);
    vec3 color = mix(uBlue, uViolet, vMix);
    color = mix(color, uWhite, vCrest * 0.55);
    gl_FragColor = vec4(color, alpha * vFade * 0.85);
  }
`;

/** Deterministic 0–1 noise, so every visit draws the same field. */
function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * A field of glowing points rolling like a calm sea — one draw call, no textures.
 * Returns null when WebGL is unavailable; the page keeps its CSS backdrop.
 */
export function createParticleWave(host: HTMLElement, { still }: Options): ParticleWaveHandle | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
  } catch {
    return null;
  }

  const compact = host.clientWidth < 768;
  const cols = compact ? 84 : 150;
  const rows = compact ? 44 : 72;
  const width = 30;
  const depth = 24;

  const positions = new Float32Array(cols * rows * 3);
  const seeds = new Float32Array(cols * rows);
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions[i * 3] = (c / (cols - 1) - 0.5) * width;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 4 - (r / (rows - 1)) * depth;
      seeds[i] = hash(i);
      i++;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  const material = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uSize: { value: compact ? 2.6 : 3.2 },
      uBlue: { value: new Color("#5aa9ff") },
      uViolet: { value: new Color("#9b7bff") },
      uWhite: { value: new Color("#ffffff") },
    },
  });

  const scene = new Scene();
  scene.add(new Points(geometry, material));

  const camera = new PerspectiveCamera(52, 1, 0.1, 100);
  camera.position.set(0, 3.1, 8);
  camera.lookAt(0, -0.4, -6);

  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
  host.appendChild(canvas);

  const resize = () => {
    const w = Math.max(host.clientWidth, 1);
    const h = Math.max(host.clientHeight, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (still) renderer.render(scene, camera);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  // A slight camera sway toward the pointer — desktop only.
  let targetX = 0;
  let targetY = 0;
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    targetX = (event.clientX / window.innerWidth - 0.5) * 1.2;
    targetY = (event.clientY / window.innerHeight - 0.5) * 0.5;
  };

  let frame = 0;
  let running = false;
  let last = performance.now();
  let elapsed = 0;

  const tick = (now: number) => {
    elapsed += Math.min((now - last) / 1000, 0.05);
    last = now;
    material.uniforms.uTime.value = elapsed;
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (3.1 - targetY - camera.position.y) * 0.04;
    camera.lookAt(0, -0.4, -6);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  };

  // A GPU reset takes the scene with it; it is decoration, so just stop and fade out.
  let lost = false;
  const onContextLost = (event: Event) => {
    event.preventDefault();
    setActive(false);
    lost = true;
    canvas.style.opacity = "0";
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  const setActive = (active: boolean) => {
    if (still || lost || active === running) return;
    running = active;
    if (active) {
      last = performance.now();
      window.addEventListener("pointermove", onPointer, { passive: true });
      frame = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
    }
  };

  if (still) {
    material.uniforms.uTime.value = 2.4;
    renderer.render(scene, camera);
  }

  return {
    setActive,
    destroy() {
      setActive(false);
      cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      // Free the context now — browsers cap how many can be alive at once.
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
