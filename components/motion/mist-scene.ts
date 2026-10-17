export type MistHandle = {
  destroy: () => void;
};

type Options = {
  /** Draw one still frame and never animate. */
  still: boolean;
};

const VERTEX = /* glsl */ `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision mediump float;

uniform vec2 uResolution;
uniform float uTime;     // flow time: runs faster while the page is being scrolled
uniform vec2 uPointer;   // 0–1 across the viewport, y up
uniform float uClear;    // 0–1: how present the cursor's clearing is (fades when the mouse leaves)
uniform float uScroll;   // page scroll, in viewport heights

varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotate = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = rotate * p;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 screen = vec2(vUv.x * aspect, vUv.y);

  // fog lies in wide, shallow banks and rides a slow breeze; scrolling stirs it
  vec2 p = screen * vec2(1.05, 1.9);
  p.y -= uScroll * 0.55;
  float t = uTime * 0.05;
  vec2 wind = vec2(t, t * 0.12);

  // domain warping: the fog folds into itself like real mist
  vec2 q = vec2(fbm(p + wind), fbm(p + vec2(5.2, 1.3) - wind * 0.6));
  vec2 r = vec2(fbm(p + 2.6 * q + vec2(1.7, 9.2) + wind * 1.4), fbm(p + 2.6 * q + vec2(8.3, 2.8) - wind * 0.4));

  // two layers: broad soft banks, and finer wisps curling through them
  float banks = smoothstep(0.3, 0.64, fbm(p * 0.78 + q * 0.9 + wind * 0.5));
  float wisps = smoothstep(0.36, 0.7, fbm(p * 1.15 + 2.2 * r));
  // like real ground fog it settles a little thicker toward the bottom, over a faint haze
  float settle = 0.8 + 0.4 * (1.0 - vUv.y);
  float density = clamp((banks * 0.7 + wisps * 0.55) * settle + 0.1, 0.0, 1.0);

  // the cursor parts the mist, like a hand passing through morning fog
  vec2 toPointer = screen - vec2(uPointer.x * aspect, uPointer.y);
  density *= 1.0 - 0.7 * uClear * exp(-dot(toPointer, toPointer) * 12.0);

  // keep the reading column a little calmer than the margins
  density *= 0.8 + 0.2 * smoothstep(0.08, 0.5, abs(vUv.x - 0.5));

  // pale blue and lavender veils over white paper; body text keeps a strong contrast
  vec3 tint = mix(vec3(0.79, 0.86, 0.972), vec3(0.87, 0.84, 0.968), smoothstep(0.35, 0.75, q.y));
  vec3 color = mix(vec3(1.0), tint, density * 0.86);
  // light pooling where the veil thins, for a sense of depth
  color += (1.0 - density) * 0.03 * smoothstep(0.45, 0.85, r.x);

  gl_FragColor = vec4(min(color, vec3(1.0)), 1.0);
}
`;

/** The fog is soft by nature, so it renders small and the browser scales it up. */
const RESOLUTION_SCALE = 0.35;
/** Fog drifts slowly — 30 fps is indistinguishable and halves the work. */
const FRAME_MS = 1000 / 30;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Living morning mist for the white theme: domain-warped noise drifting on a breeze,
 * parting around the cursor and stirring as the page scrolls. Raw WebGL — one
 * full-screen triangle — so it costs no three.js download. Returns null without WebGL.
 */
export function createMist(canvas: HTMLCanvasElement, { still }: Options): MistHandle | null {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // one triangle that covers the whole screen
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {
    resolution: gl.getUniformLocation(program, "uResolution"),
    time: gl.getUniformLocation(program, "uTime"),
    pointer: gl.getUniformLocation(program, "uPointer"),
    clear: gl.getUniformLocation(program, "uClear"),
    scroll: gl.getUniformLocation(program, "uScroll"),
  };

  const resize = () => {
    const width = Math.max(1, Math.round(window.innerWidth * RESOLUTION_SCALE));
    const height = Math.max(1, Math.round(window.innerHeight * RESOLUTION_SCALE));
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uniforms.resolution, width, height);
  };
  resize();

  // eased inputs
  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, clear: 0, present: false, seen: false };
  let scroll = window.scrollY / Math.max(window.innerHeight, 1);
  let stir = 0;
  // start inside a thick bank so the first impression is misty
  let flow = 62;

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    pointer.tx = event.clientX / window.innerWidth;
    pointer.ty = 1 - event.clientY / window.innerHeight;
    if (!pointer.seen) {
      pointer.x = pointer.tx;
      pointer.y = pointer.ty;
      pointer.seen = true;
    }
    pointer.present = true;
  };
  const onPointerLeave = () => {
    pointer.present = false;
  };

  const draw = () => {
    gl.uniform1f(uniforms.time, flow);
    gl.uniform2f(uniforms.pointer, pointer.x, pointer.y);
    gl.uniform1f(uniforms.clear, pointer.clear);
    gl.uniform1f(uniforms.scroll, scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  let frame = 0;
  let last = performance.now();
  let lost = false;

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    const dt = now - last;
    if (dt < FRAME_MS || document.hidden) return;
    last = now;
    const seconds = Math.min(dt / 1000, 0.1);

    // scrolling stirs the air: the fog churns faster for a moment, then settles
    const target = window.scrollY / Math.max(window.innerHeight, 1);
    const speed = Math.min(Math.abs(target - scroll) / seconds / 3, 1);
    scroll += (target - scroll) * 0.25;
    stir += (speed - stir) * 0.08;
    flow += seconds * (1 + stir * 2.5);

    // a lazy follow, so the clearing trails the cursor like a wake
    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;
    pointer.clear += ((pointer.present ? 1 : 0) - pointer.clear) * 0.05;

    resize();
    draw();
  };

  // resizing clears the canvas, so repaint at once rather than flash an empty frame
  const onResize = () => {
    if (lost) return;
    resize();
    draw();
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    canvas.dataset.ready = "false";
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  if (still) {
    draw();
  } else {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    draw();
    frame = requestAnimationFrame(tick);
  }
  window.addEventListener("resize", onResize);

  return {
    destroy() {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      if (!lost) {
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    },
  };
}
