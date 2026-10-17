"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { anchor, createRandom, displayColor, type RigRef } from "./shared";

const VERTEX = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uLight;
uniform float uTwinkle;
uniform vec3 uInkA;
uniform vec3 uInkB;

attribute float aSize;
attribute float aPhase;
attribute vec3 aColor;

varying vec3 vColor;
varying float vAlpha;
varying float vFlare;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float depth = -mvPosition.z;

  // Atmospheric scintillation: three out-of-step rhythms read as irregular twinkling —
  // quicker and stronger for bright stars, which also shimmer slightly in colour.
  float bright = smoothstep(2.0, 4.6, aSize);
  float pace = mix(0.8, 2.6, bright);
  float s1 = sin(uTime * pace * (1.0 + aPhase * 1.7) + aPhase * 41.0);
  float s2 = sin(uTime * pace * (2.3 + aPhase * 3.1) + aPhase * 17.0);
  float s3 = sin(uTime * (0.31 + aPhase * 0.6) + aPhase * 7.0);
  float flicker = clamp(0.5 + 0.3 * s1 + 0.15 * s2 + 0.2 * s3, 0.0, 1.0);
  vec3 shimmer = vec3(0.18 * s2, 0.06 * s1, -0.18 * s2) * bright;

  vColor = mix(aColor * (1.0 + shimmer), mix(uInkA, uInkB, fract(aPhase * 7.31)), uLight);
  // anything about to pass the lens fades out instead of ballooning
  vAlpha = (1.0 - uTwinkle * flicker) * smoothstep(0.5, 6.0, depth);
  // only the brightest stars get diffraction spikes, and need room to draw them
  vFlare = step(3.4, aSize);

  float size = aSize * clamp(30.0 / depth, 0.6, 2.4);
  size *= mix(1.0, 3.0, vFlare);
  size *= mix(1.0, 0.8, uLight);
  gl_PointSize = max(size * uPixelRatio, 1.5);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAGMENT = /* glsl */ `
uniform float uLight;
uniform float uOpacity;
uniform float uInkOpacity;

varying vec3 vColor;
varying float vAlpha;
varying float vFlare;

void main() {
  vec2 p = (gl_PointCoord - 0.5) * 2.0;
  float d = length(p) * mix(1.0, 3.0, vFlare);

  float glow = smoothstep(1.0, 0.2, d);
  float spikes = vFlare * exp(-abs(p.x * p.y) * 240.0) * pow(clamp(1.0 - length(p), 0.0, 1.0), 2.0);
  float ink = smoothstep(0.8, 0.5, d);

  // On the dark sky stars are light; on white they become ink dots.
  float alpha = mix((glow + spikes * 0.7) * uOpacity, ink * uInkOpacity, uLight) * vAlpha;

  // Premultiplied output: a coverage of 0 adds light, a coverage of alpha paints over.
  gl_FragColor = vec4(vColor * alpha, alpha * uLight);
}
`;

type PointCloud = {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  phases: Float32Array;
};

function toGeometry({ positions, colors, sizes, phases }: PointCloud) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  return geometry;
}

function allocate(count: number): PointCloud {
  return {
    positions: new Float32Array(count * 3),
    colors: new Float32Array(count * 3),
    sizes: new Float32Array(count),
    phases: new Float32Array(count),
  };
}

type TwinklePointsProps = {
  rig: RigRef;
  geometry: THREE.BufferGeometry;
  /** 0 = steady, 1 = stars blink fully off */
  twinkle: number;
  opacity: number;
  inkOpacity: number;
};

function TwinklePoints({ rig, geometry, twinkle, opacity, inkOpacity }: TwinklePointsProps) {
  const material = useRef<THREE.ShaderMaterial>(null);

  const parameters = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uLight: { value: 0 },
        uTwinkle: { value: twinkle },
        uOpacity: { value: opacity },
        uInkOpacity: { value: inkOpacity },
        uInkA: { value: displayColor("#12813c") },
        uInkB: { value: displayColor("#5b5bd6") },
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
      premultipliedAlpha: true,
    }),
    [twinkle, opacity, inkOpacity]
  );

  useFrame((state) => {
    const uniforms = material.current?.uniforms;
    if (!uniforms) return;
    uniforms.uTime.value = rig.current.time;
    uniforms.uLight.value = rig.current.light;
    uniforms.uPixelRatio.value = state.gl.getPixelRatio();
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial ref={material} args={[parameters]} />
    </points>
  );
}

/* -------------------------------------------------------------------------- */
/* Stars                                                                      */
/* -------------------------------------------------------------------------- */

// Real star colours by surface temperature: mostly white and yellow-white,
// a few hot blue-white stars and some cool orange giants.
const STAR_TINTS: [color: string, share: number][] = [
  ["#aabfff", 0.1], // B — blue-white
  ["#cad7ff", 0.2], // A — white, faintly blue
  ["#f8f7ff", 0.3], // F — white
  ["#fff4ea", 0.2], // G — yellow-white, like the Sun
  ["#ffd2a1", 0.13], // K — pale orange
  ["#ffb56c", 0.07], // M — orange
];

function createStars(count: number) {
  const random = createRandom(20231);
  const cloud = allocate(count);
  const tints = STAR_TINTS.map(([color, share]) => ({ color: displayColor(color), share }));

  for (let i = 0; i < count; i++) {
    cloud.positions[i * 3] = (random() - 0.5) * 190;
    cloud.positions[i * 3 + 1] = (random() - 0.5) * 124;
    // start beyond the planets and their rings, so no star ever hangs in front of one
    cloud.positions[i * 3 + 2] = -16 - random() * 134;

    let pick = random();
    let tint = tints[0].color;
    for (const candidate of tints) {
      tint = candidate.color;
      if (pick < candidate.share) break;
      pick -= candidate.share;
    }
    cloud.colors[i * 3] = tint.r;
    cloud.colors[i * 3 + 1] = tint.g;
    cloud.colors[i * 3 + 2] = tint.b;

    // a long tail: most stars are faint specks, a handful are bright
    cloud.sizes[i] = 1.2 + Math.pow(random(), 7) * 3.8;
    cloud.phases[i] = random();
  }

  return toGeometry(cloud);
}

export function Stars({ rig, count }: { rig: RigRef; count: number }) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => createStars(count), [count]);

  useFrame(() => {
    // the whole sky wheels very slowly around the line of sight
    if (group.current) group.current.rotation.z = rig.current.time * 0.004;
  });

  return (
    <group ref={group}>
      <TwinklePoints rig={rig} geometry={geometry} twinkle={0.6} opacity={0.95} inkOpacity={0.42} />
      <StarStreaks rig={rig} stars={geometry} />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Motion streaks                                                             */
/* -------------------------------------------------------------------------- */

const STREAK_VERTEX = /* glsl */ `
uniform vec2 uShift;
attribute float aEnd;
attribute vec3 aColor;

varying vec3 vColor;
varying float vFade;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  // The camera flew forward and down during the "exposure": the star's earlier
  // image sat deeper and lower, so its streak trails back toward the centre.
  mvPosition.y -= aEnd * uShift.x;
  mvPosition.z = min(mvPosition.z - aEnd * uShift.y, -0.5);
  vColor = aColor;
  vFade = 1.0 - aEnd;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const STREAK_FRAGMENT = /* glsl */ `
uniform float uOpacity;
uniform float uLight;

varying vec3 vColor;
varying float vFade;

void main() {
  float alpha = vFade * vFade * uOpacity;
  gl_FragColor = vec4(vColor * alpha, alpha * uLight);
}
`;

/** Camera travel per unit of page scroll — mirrors the rig in SpaceScene. */
const TRAVEL_Y = 2.2;
const TRAVEL_Z = 9;

/**
 * Like a long camera exposure: while the page is flung, the brighter stars smear
 * into streaks along the direction of travel, and settle back to points at rest.
 */
function StarStreaks({ rig, stars }: { rig: RigRef; stars: THREE.BufferGeometry }) {
  const lines = useRef<THREE.LineSegments<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const motion = useRef({ scroll: 0, velocity: 0, time: 0 });

  const geometry = useMemo(() => {
    const source = stars.attributes.position as THREE.BufferAttribute;
    const colors = stars.attributes.aColor as THREE.BufferAttribute;
    const sizes = stars.attributes.aSize as THREE.BufferAttribute;
    const picked: number[] = [];
    for (let i = 0; i < source.count; i++) if (sizes.getX(i) > 1.45) picked.push(i);

    const positions = new Float32Array(picked.length * 6);
    const tints = new Float32Array(picked.length * 6);
    const ends = new Float32Array(picked.length * 2);
    picked.forEach((index, i) => {
      for (let end = 0; end < 2; end++) {
        const v = i * 2 + end;
        positions.set([source.getX(index), source.getY(index), source.getZ(index)], v * 3);
        tints.set([colors.getX(index), colors.getY(index), colors.getZ(index)], v * 3);
        ends[v] = end;
      }
    });

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    lineGeometry.setAttribute("aColor", new THREE.BufferAttribute(tints, 3));
    lineGeometry.setAttribute("aEnd", new THREE.BufferAttribute(ends, 1));
    return lineGeometry;
  }, [stars]);

  const parameters = useMemo(
    () => ({
      uniforms: { uShift: { value: new THREE.Vector2() }, uOpacity: { value: 0 }, uLight: { value: 0 } },
      vertexShader: STREAK_VERTEX,
      fragmentShader: STREAK_FRAGMENT,
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
    }),
    []
  );

  useFrame(() => {
    const mesh = lines.current;
    if (!mesh) return;
    const { time, scroll, light } = rig.current;
    const state = motion.current;
    const dt = time - state.time;
    state.time = time;
    if (dt <= 0) {
      mesh.visible = false;
      return;
    }

    const velocity = (scroll - state.scroll) / dt;
    state.scroll = scroll;
    state.velocity = THREE.MathUtils.damp(state.velocity, velocity, 6, dt);

    // how far the camera moved during a 0.6 s "exposure", capped for very hard flings
    const exposure = THREE.MathUtils.clamp(state.velocity * 0.6, -0.12, 0.12);
    const strength = THREE.MathUtils.smoothstep(Math.abs(exposure), 0.008, 0.05);
    mesh.visible = strength > 0.01;
    mesh.material.uniforms.uShift.value.set(exposure * TRAVEL_Y, exposure * TRAVEL_Z);
    mesh.material.uniforms.uOpacity.value = strength * 0.8;
    mesh.material.uniforms.uLight.value = light;
  });

  return (
    <lineSegments ref={lines} geometry={geometry} frustumCulled={false} visible={false}>
      <shaderMaterial args={[parameters]} />
    </lineSegments>
  );
}

/* -------------------------------------------------------------------------- */
/* Spiral galaxy                                                              */
/* -------------------------------------------------------------------------- */

const GALAXY_ARMS = 4;
const GALAXY_RADIUS = 11;
const GALAXY_DEPTH = 62;

function createGalaxy(count: number) {
  const random = createRandom(77041);
  const cloud = allocate(count);
  // an old, warm core; young blue-white arms; pink star-forming knots along them
  const core = displayColor("#fff3d6");
  const arms = displayColor("#bcd2ff");
  const rim = displayColor("#8a82ff");
  const knot = displayColor("#ffb3d4");
  const tint = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const radius = Math.pow(random(), 1.7) * GALAXY_RADIUS;
    const angle = ((i % GALAXY_ARMS) / GALAXY_ARMS) * Math.PI * 2 + radius * 0.42;
    const spread = 0.25 + radius * 0.11;
    const scatter = () => Math.pow(random(), 2.6) * (random() < 0.5 ? -1 : 1) * spread;

    cloud.positions[i * 3] = Math.cos(angle) * radius + scatter();
    cloud.positions[i * 3 + 1] = scatter() * 0.35;
    cloud.positions[i * 3 + 2] = Math.sin(angle) * radius + scatter();

    const t = radius / GALAXY_RADIUS;
    if (t < 0.35) tint.lerpColors(core, arms, t / 0.35);
    else tint.lerpColors(arms, rim, (t - 0.35) / 0.65);
    if (t > 0.3 && random() < 0.05) tint.copy(knot);
    cloud.colors[i * 3] = tint.r;
    cloud.colors[i * 3 + 1] = tint.g;
    cloud.colors[i * 3 + 2] = tint.b;

    cloud.sizes[i] = 1.2 + Math.pow(random(), 4) * 1.8;
    cloud.phases[i] = random();
  }

  return toGeometry(cloud);
}

export function Galaxy({ rig, count, aspect }: { rig: RigRef; count: number; aspect: number }) {
  const disc = useRef<THREE.Group>(null);
  const geometry = useMemo(() => createGalaxy(count), [count]);

  useFrame(() => {
    if (disc.current) disc.current.rotation.y = rig.current.time * 0.025;
  });

  return (
    <group
      position={anchor(0.7, 0.6, GALAXY_DEPTH, aspect)}
      rotation={[1.05, 0, 0.4]}
      scale={Math.min(1, aspect * 0.9)}
    >
      <group ref={disc}>
        <TwinklePoints rig={rig} geometry={geometry} twinkle={0.25} opacity={0.62} inkOpacity={0.3} />
      </group>
    </group>
  );
}
