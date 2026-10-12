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

  float flicker = 0.5 + 0.5 * sin(uTime * (0.7 + aPhase * 2.6) + aPhase * 41.0);

  vColor = mix(aColor, mix(uInkA, uInkB, fract(aPhase * 7.31)), uLight);
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

// Mostly cool blue-white, with a few warm, mint and violet stars for variety.
const STAR_TINTS: [color: string, share: number][] = [
  ["#cfe0ff", 0.42],
  ["#ffffff", 0.26],
  ["#ffe9cc", 0.14],
  ["#b9ffdf", 0.12],
  ["#dccbff", 0.06],
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
    </group>
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
  const core = displayColor("#fff3d6");
  const arms = displayColor("#6ee7b0");
  const rim = displayColor("#7c6cff");
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
