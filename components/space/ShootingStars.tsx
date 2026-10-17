"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA_FOV, displayColor, type RigRef } from "./shared";

/* -------------------------------------------------------------------------- */
/* Shaders                                                                    */
/* -------------------------------------------------------------------------- */

const VERTEX = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * The meteor's path, start (u = 0) → head (u = 1). Two things live on it:
 * the white-hot tail right behind the head, and the ionisation train — a faint,
 * wider glow that lingers along the whole path and slowly breaks up.
 */
const PATH_FRAGMENT = /* glsl */ `
uniform float uLength;
uniform float uTail;
uniform float uBright;
uniform float uTrain;
uniform float uSpread;
uniform float uTime;
uniform float uSeed;
uniform float uLight;
uniform vec3 uHeadColor;
uniform vec3 uTailColor;
uniform vec3 uTrainColor;
uniform vec3 uInk;

varying vec2 vUv;

float hash(float n) { return fract(sin(n) * 43758.5453); }
float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash(i), hash(i + 1.0), f * f * (3.0 - 2.0 * f));
}

void main() {
  float behind = (1.0 - vUv.x) * uLength;   // world units behind the head
  float across = abs(vUv.y - 0.5) * 2.0;    // 0 on the axis → 1 at the quad's edge

  // tail: thin and tapering, cooling from white-hot to the emission colour
  float t = clamp(behind / uTail, 0.0, 1.0);
  float width = mix(0.15, 0.03, t);
  float core = exp(-pow(across / width, 2.0));
  // capped so a flaring fireball blooms at the head instead of fattening its whole tail
  float tail = core * pow(1.0 - t, 1.7) * min(uBright, 1.2);
  vec3 tailColor = mix(uHeadColor, uTailColor, smoothstep(0.0, 0.45, t));

  // train: wider, grainy, and drifting apart as it ages
  float grain = noise(vUv.x * uLength * 1.6 + uSeed * 37.0 + uTime * 0.7) * 0.6
              + noise(vUv.x * uLength * 4.3 - uTime * 1.1 + uSeed * 11.0) * 0.4;
  float wobble = (noise(vUv.x * uLength * 0.8 + uTime * 0.35 + uSeed) - 0.5) * uSpread * 0.5;
  float train = exp(-pow((across + wobble) / uSpread, 2.0))
              * (0.25 + 0.75 * grain)
              * smoothstep(0.0, 0.1, vUv.x)
              * uTrain;

  float alpha = tail + train * 0.5;
  vec3 color = tailColor * tail + uTrainColor * train * 0.5;
  // premultiplied: on the night sky this only adds light
  gl_FragColor = vec4(mix(color, uInk * alpha, uLight), alpha * uLight);
}
`;

/** The glowing head: a hot core inside a soft coma. */
const HEAD_FRAGMENT = /* glsl */ `
uniform float uBright;
uniform float uLight;
uniform vec3 uColor;
uniform vec3 uInk;

varying vec2 vUv;

void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float r2 = dot(p, p);
  float core = exp(-r2 * 70.0);
  float coma = exp(-r2 * 7.5) * 0.4;
  float alpha = (core + coma) * uBright;
  vec3 color = mix(uColor, vec3(1.0), core);
  gl_FragColor = vec4(mix(color * alpha, uInk * alpha, uLight), alpha * uLight);
}
`;

const SPARK_VERTEX = /* glsl */ `
uniform float uPixelRatio;
attribute float aLife;
varying float vLife;

void main() {
  vLife = aLife;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = (1.0 + 3.2 * aLife) * uPixelRatio * clamp(34.0 / -mvPosition.z, 0.5, 2.0);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const SPARK_FRAGMENT = /* glsl */ `
uniform float uLight;
varying float vLife;

void main() {
  if (vLife <= 0.0) discard;
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float alpha = smoothstep(1.0, 0.0, d) * vLife;
  // fragments burn white-yellow and cool to deep orange
  vec3 color = mix(vec3(1.0, 0.36, 0.12), vec3(1.0, 0.92, 0.72), vLife);
  gl_FragColor = vec4(color * alpha, alpha * uLight);
}
`;

/* -------------------------------------------------------------------------- */
/* Meteor model                                                               */
/* -------------------------------------------------------------------------- */

type Kind = "sporadic" | "shower" | "fireball";

type Palette = { head: THREE.Color; tail: THREE.Color; train: THREE.Color };

// Emission colours: hot white heads, blue-white or magnesium-green tails, faint blue trains.
const PALETTES: Record<Kind, Palette> = {
  sporadic: { head: displayColor("#f5fbff"), tail: displayColor("#9fd5ff"), train: displayColor("#6f86ff") },
  shower: { head: displayColor("#f2fff8"), tail: displayColor("#a3ffd6"), train: displayColor("#7fb2ff") },
  fireball: { head: displayColor("#fffdf2"), tail: displayColor("#86ffbf"), train: displayColor("#93a6ff") },
};

type Meteor = {
  active: boolean;
  kind: Kind;
  age: number;
  /** Seconds in flight; afterwards only the train remains. */
  duration: number;
  trainLife: number;
  trainStrength: number;
  startX: number;
  startY: number;
  z: number;
  dirX: number;
  dirY: number;
  speed: number;
  tail: number;
  thickness: number;
  headSize: number;
  peak: number;
  seed: number;
  sparkClock: number;
};

const POOL = 10;
const SPARKS = 120;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const between = (min: number, max: number) => min + Math.random() * (max - min);

function createMeteor(): Meteor {
  return {
    active: false,
    kind: "sporadic",
    age: 0,
    duration: 1,
    trainLife: 1,
    trainStrength: 0,
    startX: 0,
    startY: 0,
    z: 0,
    dirX: 0,
    dirY: -1,
    speed: 0,
    tail: 1,
    thickness: 0.3,
    headSize: 1,
    peak: 1,
    seed: 0,
    sparkClock: 0,
  };
}

type View = { x: number; y: number; z: number; aspect: number };

/** Half the visible height at `depth` in front of the camera. */
function halfHeightAt(depth: number) {
  return Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)) * depth;
}

/**
 * Fill a slot with a new meteor. Sizes and speeds scale with depth so every meteor
 * crosses the sky at a believable angular speed, wherever it happens to be.
 */
function launch(meteor: Meteor, kind: Kind, view: View, radiant: { x: number; y: number }) {
  const depth = kind === "fireball" ? between(30, 40) : between(26, 58);
  const halfH = halfHeightAt(depth);
  const halfW = halfH * view.aspect;

  meteor.active = true;
  meteor.kind = kind;
  meteor.age = 0;
  meteor.z = view.z - depth;
  meteor.seed = Math.random() * 100;
  meteor.sparkClock = 0;

  if (kind === "shower") {
    // all members of a shower fly away from one radiant point above the top-right corner
    const rx = radiant.x * halfW;
    const ry = radiant.y * halfH;
    const targetX = between(-0.95, 0.85) * halfW;
    const targetY = between(-0.6, 0.85) * halfH;
    const dx = targetX - rx;
    const dy = targetY - ry;
    const distance = Math.hypot(dx, dy) || 1;
    meteor.dirX = dx / distance;
    meteor.dirY = dy / distance;
    const head = between(0.35, 0.85) * distance;
    meteor.startX = view.x + rx + meteor.dirX * head;
    meteor.startY = view.y + ry + meteor.dirY * head;
    meteor.speed = halfH * between(1.6, 2.4);
    meteor.duration = between(0.32, 0.6);
    meteor.tail = halfH * between(0.22, 0.34);
    meteor.thickness = halfH * 0.011;
    meteor.headSize = halfH * 0.045;
    meteor.peak = between(0.75, 1.15);
    meteor.trainStrength = between(0.2, 0.4);
    meteor.trainLife = between(0.8, 1.4);
    return;
  }

  // sporadic and fireball: anywhere in the upper sky, heading downward at a slant
  const side = Math.random() < 0.62 ? -1 : 1;
  const slant = kind === "fireball" ? between(0.95, 1.3) : between(0.3, 1.15);
  const angle = -Math.PI / 2 + side * slant;
  meteor.dirX = Math.cos(angle);
  meteor.dirY = Math.sin(angle);
  meteor.startX = view.x + between(-0.75, 0.75) * halfW - meteor.dirX * halfW * 0.25;
  meteor.startY = view.y + between(0.05, 0.95) * halfH;

  if (kind === "fireball") {
    meteor.speed = halfH * between(0.55, 0.8);
    meteor.duration = between(1.7, 2.4);
    meteor.tail = halfH * between(0.5, 0.7);
    meteor.thickness = halfH * 0.028;
    meteor.headSize = halfH * 0.12;
    meteor.peak = 1.35;
    meteor.trainStrength = 0.75;
    meteor.trainLife = between(2.6, 3.6);
  } else {
    meteor.speed = halfH * between(1.1, 2);
    meteor.duration = between(0.38, 0.9);
    meteor.tail = halfH * between(0.25, 0.42);
    meteor.thickness = halfH * 0.012;
    meteor.headSize = halfH * 0.05;
    meteor.peak = between(0.7, 1.2);
    meteor.trainStrength = between(0.15, 0.35);
    meteor.trainLife = between(0.7, 1.3);
  }
}

/** Brightness over the flight: a quick rise, a long plateau, a fade — and for fireballs a terminal burst. */
function lightCurve(meteor: Meteor, life: number) {
  let brightness = smoothstep(0, 0.14, life) * (1 - smoothstep(0.7, 1, life));
  if (meteor.kind === "fireball") {
    brightness *= 1 + 1.5 * Math.exp(-Math.pow((life - 0.8) * 11, 2));
  }
  const flicker = 0.86 + 0.14 * Math.sin(meteor.age * 47 + meteor.seed * 10) * Math.sin(meteor.age * 23 + meteor.seed);
  return brightness * flicker * meteor.peak;
}

/** How far the head has travelled: fast at first, then dragging slightly as the air thickens. */
function travelled(meteor: Meteor, age: number) {
  const t = Math.min(age, meteor.duration);
  return meteor.speed * t * (1 - 0.18 * (t / meteor.duration));
}

type Spark = { x: number; y: number; z: number; vx: number; vy: number; life: number; decay: number };

type PathMesh = THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

/**
 * Meteors that behave like the real thing: sporadic ones every few seconds,
 * showers whose members all stream from a single radiant, and the occasional
 * fireball that flares, sheds burning fragments and leaves a glowing train behind.
 */
export default function ShootingStars({ rig, aspect }: { rig: RigRef; aspect: number }) {
  const paths = useRef<(PathMesh | null)[]>([]);
  const heads = useRef<(PathMesh | null)[]>([]);
  const sparkPoints = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const meteors = useRef<Meteor[]>(Array.from({ length: POOL }, createMeteor));
  const sparks = useRef<Spark[]>(
    Array.from({ length: SPARKS }, () => ({ x: 0, y: 0, z: 0, vx: 0, vy: 0, life: 0, decay: 1 }))
  );
  const lastTime = useRef(0);
  // countdowns, in seconds of animation time
  const clocks = useRef({ sporadic: 2.5, shower: 11, fireball: 18, burstLeft: 0, burstGap: 0 });
  const radiant = useRef({ x: 0.85, y: 1.25 });

  const pathParameters = useMemo(
    () =>
      Array.from({ length: POOL }, () => ({
        uniforms: {
          uLength: { value: 1 },
          uTail: { value: 1 },
          uBright: { value: 0 },
          uTrain: { value: 0 },
          uSpread: { value: 0.35 },
          uTime: { value: 0 },
          uSeed: { value: 0 },
          uLight: { value: 0 },
          uHeadColor: { value: PALETTES.sporadic.head.clone() },
          uTailColor: { value: PALETTES.sporadic.tail.clone() },
          uTrainColor: { value: PALETTES.sporadic.train.clone() },
          uInk: { value: displayColor("#1a56db") },
        },
        vertexShader: VERTEX,
        fragmentShader: PATH_FRAGMENT,
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
      })),
    []
  );

  const headParameters = useMemo(
    () =>
      Array.from({ length: POOL }, () => ({
        uniforms: {
          uBright: { value: 0 },
          uLight: { value: 0 },
          uColor: { value: PALETTES.sporadic.head.clone() },
          uInk: { value: displayColor("#1a56db") },
        },
        vertexShader: VERTEX,
        fragmentShader: HEAD_FRAGMENT,
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
      })),
    []
  );

  const sparkGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3));
    geometry.setAttribute("aLife", new THREE.BufferAttribute(new Float32Array(SPARKS), 1));
    return geometry;
  }, []);

  const sparkParameters = useMemo(
    () => ({
      uniforms: { uPixelRatio: { value: 1 }, uLight: { value: 0 } },
      vertexShader: SPARK_VERTEX,
      fragmentShader: SPARK_FRAGMENT,
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
    }),
    []
  );

  useFrame((state) => {
    const { time, light } = rig.current;
    const delta = Math.min(time - lastTime.current, 0.1);
    lastTime.current = time;
    const camera = state.camera;
    const view: View = { x: camera.position.x, y: camera.position.y, z: camera.position.z, aspect };

    /* ---- scheduling ---------------------------------------------------- */
    const spawn = (kind: Kind) => {
      const slot = meteors.current.find((meteor) => !meteor.active);
      if (slot) launch(slot, kind, view, radiant.current);
    };

    if (delta > 0) {
      const clock = clocks.current;
      clock.sporadic -= delta;
      clock.shower -= delta;
      clock.fireball -= delta;

      if (clock.sporadic <= 0) {
        spawn("sporadic");
        clock.sporadic = between(2.5, 7);
      }
      if (clock.shower <= 0) {
        // a burst: several meteors from the same radiant within a few seconds
        clock.burstLeft = Math.round(between(3, 6));
        clock.burstGap = 0;
        radiant.current = { x: between(0.55, 1.05), y: between(1.1, 1.4) };
        clock.shower = between(26, 46);
      }
      if (clock.burstLeft > 0) {
        clock.burstGap -= delta;
        if (clock.burstGap <= 0) {
          spawn("shower");
          clock.burstLeft -= 1;
          clock.burstGap = between(0.15, 0.75);
        }
      }
      if (clock.fireball <= 0) {
        spawn("fireball");
        clock.fireball = between(50, 85);
      }
    }

    /* ---- meteors ------------------------------------------------------- */
    meteors.current.forEach((meteor, i) => {
      const path = paths.current[i];
      const head = heads.current[i];
      if (!path || !head) return;

      if (!meteor.active) {
        path.visible = false;
        head.visible = false;
        return;
      }

      meteor.age += delta;
      const life = meteor.age / meteor.duration;
      const afterglow = (meteor.age - meteor.duration) / meteor.trainLife;
      if (afterglow >= 1) {
        meteor.active = false;
        path.visible = false;
        head.visible = false;
        return;
      }

      const distance = Math.max(travelled(meteor, meteor.age), 0.001);
      const headX = meteor.startX + meteor.dirX * distance;
      const headY = meteor.startY + meteor.dirY * distance;
      const angle = Math.atan2(meteor.dirY, meteor.dirX);
      const palette = PALETTES[meteor.kind];
      const brightness = life < 1 ? lightCurve(meteor, life) : 0;

      // the train builds up behind the head, then lingers, spreads and fades
      const train =
        life < 1
          ? meteor.trainStrength * smoothstep(0.05, 0.5, life)
          : meteor.trainStrength * Math.pow(1 - afterglow, 1.6);
      const spread = 0.3 + 0.35 * Math.max(0, afterglow);

      path.visible = true;
      path.position.set(meteor.startX + meteor.dirX * distance * 0.5, meteor.startY + meteor.dirY * distance * 0.5, meteor.z);
      path.rotation.z = angle;
      path.scale.set(distance, meteor.thickness * 4, 1);
      const u = path.material.uniforms;
      u.uLength.value = distance;
      u.uTail.value = meteor.tail;
      u.uBright.value = brightness;
      u.uTrain.value = train;
      u.uSpread.value = spread;
      u.uTime.value = time;
      u.uSeed.value = meteor.seed;
      u.uLight.value = light;
      u.uHeadColor.value.copy(palette.head);
      u.uTailColor.value.copy(palette.tail);
      u.uTrainColor.value.copy(palette.train);

      head.visible = brightness > 0.002;
      head.position.set(headX, headY, meteor.z + 0.01);
      head.scale.setScalar(meteor.headSize * (0.85 + 0.3 * Math.min(brightness, 1.6)));
      head.material.uniforms.uBright.value = brightness;
      head.material.uniforms.uLight.value = light;
      head.material.uniforms.uColor.value.copy(palette.head);

      // fireballs shed burning fragments once they hit the thicker air
      if (meteor.kind === "fireball" && life > 0.35 && life < 0.95) {
        meteor.sparkClock -= delta;
        while (meteor.sparkClock <= 0) {
          meteor.sparkClock += 1 / 55;
          const spark = sparks.current.find((candidate) => candidate.life <= 0);
          if (!spark) break;
          const drift = meteor.speed * between(0.15, 0.45);
          spark.x = headX;
          spark.y = headY;
          spark.z = meteor.z;
          spark.vx = meteor.dirX * drift + between(-1, 1) * meteor.headSize * 0.9;
          spark.vy = meteor.dirY * drift + between(-1, 1) * meteor.headSize * 0.9;
          spark.life = 1;
          spark.decay = between(0.9, 1.8);
        }
      }
    });

    /* ---- sparks -------------------------------------------------------- */
    const points = sparkPoints.current;
    if (points) {
      const position = points.geometry.attributes.position as THREE.BufferAttribute;
      const life = points.geometry.attributes.aLife as THREE.BufferAttribute;
      sparks.current.forEach((spark, i) => {
        if (spark.life > 0) {
          spark.life = Math.max(0, spark.life - delta * spark.decay);
          spark.x += spark.vx * delta;
          spark.y += spark.vy * delta;
          spark.vx *= 0.97;
          spark.vy = spark.vy * 0.97 - delta * 0.6; // a little gravity
        }
        position.setXYZ(i, spark.x, spark.y, spark.z);
        life.setX(i, spark.life);
      });
      position.needsUpdate = true;
      life.needsUpdate = true;
      points.material.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
      points.material.uniforms.uLight.value = light;
    }
  });

  return (
    <>
      {pathParameters.map((materialParameters, i) => (
        <mesh
          key={`path-${i}`}
          ref={(mesh: PathMesh | null) => {
            paths.current[i] = mesh;
          }}
          visible={false}
          frustumCulled={false}
        >
          <planeGeometry args={[1, 1]} />
          <shaderMaterial args={[materialParameters]} />
        </mesh>
      ))}
      {headParameters.map((materialParameters, i) => (
        <mesh
          key={`head-${i}`}
          ref={(mesh: PathMesh | null) => {
            heads.current[i] = mesh;
          }}
          visible={false}
          frustumCulled={false}
        >
          <planeGeometry args={[1, 1]} />
          <shaderMaterial args={[materialParameters]} />
        </mesh>
      ))}
      <points ref={sparkPoints} geometry={sparkGeometry} frustumCulled={false}>
        <shaderMaterial args={[sparkParameters]} />
      </points>
    </>
  );
}
