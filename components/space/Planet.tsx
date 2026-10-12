"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { NOISE_GLSL, displayColor, type RigRef } from "./shared";

/** Direction towards the scene's sun — upper left, in front of the camera. */
export const SUN_DIRECTION = new THREE.Vector3(-0.55, 0.45, 0.7).normalize();

/* -------------------------------------------------------------------------- */
/* Shaders                                                                    */
/* -------------------------------------------------------------------------- */

const BODY_VERTEX = /* glsl */ `
varying vec3 vSurface;
varying vec3 vWorldNormal;
varying vec3 vView;

void main() {
  vSurface = position;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const BODY_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uLight;
uniform float uBands;
uniform vec3 uSun;
uniform vec3 uDark;
uniform vec3 uBright;
uniform vec3 uStorm;
uniform vec3 uRim;
uniform vec3 uPaperDark;
uniform vec3 uPaperBright;
uniform vec3 uPaperRim;

varying vec3 vSurface;
varying vec3 vWorldNormal;
varying vec3 vView;

${NOISE_GLSL}

void main() {
  vec3 normal = normalize(vWorldNormal);
  vec3 surface = normalize(vSurface);

  // cloud bands along the latitudes, stirred by slow turbulence
  float swirl = noise3(surface * 3.2 + vec3(0.0, 0.0, uTime * 0.03));
  float latitude = surface.y * uBands + swirl * 1.7;
  float band = 0.5 + 0.5 * sin(latitude);
  float streak = 0.5 + 0.5 * sin(latitude * 3.1 + swirl * 4.0);

  float facing = dot(normal, normalize(vView));
  float diffuse = clamp(dot(normal, uSun), 0.0, 1.0);
  float fresnel = pow(1.0 - clamp(facing, 0.0, 1.0), 2.6);

  // space: a hard day/night terminator and a glowing atmosphere on the lit limb
  vec3 space = mix(uDark, uBright, band);
  space = mix(space, uStorm, streak * 0.3);
  space *= 0.04 + 0.96 * pow(diffuse, 0.85);
  space += uRim * fresnel * (0.12 + 0.88 * diffuse);

  // white: soft pastel shading with an inked outline
  vec3 paper = mix(uPaperDark, uPaperBright, band);
  paper *= 0.86 + 0.14 * diffuse;
  paper = mix(paper, uPaperRim, fresnel * 0.6);

  // fade the last pixel of the limb — a smooth silhouette without MSAA
  float edge = smoothstep(0.0, fwidth(facing) * 1.5, facing);
  gl_FragColor = vec4(mix(space, paper, uLight) * edge, edge);
}
`;

const HALO_VERTEX = /* glsl */ `
varying vec3 vWorldNormal;
varying vec3 vView;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const HALO_FRAGMENT = /* glsl */ `
uniform float uLight;
uniform float uLimb;
uniform vec3 uSun;
uniform vec3 uColor;

varying vec3 vWorldNormal;
varying vec3 vView;

void main() {
  vec3 normal = normalize(vWorldNormal);
  // inside-out shell: 0 at its outer edge, uLimb where it meets the planet
  float depth = clamp(abs(dot(normal, normalize(vView))) / uLimb, 0.0, 1.0);
  float lit = 0.2 + 0.8 * clamp(dot(normal, uSun) * 0.5 + 0.5, 0.0, 1.0);
  float alpha = pow(depth, 2.4) * lit * 0.55 * (1.0 - uLight);
  gl_FragColor = vec4(uColor * alpha, 0.0);
}
`;

const RING_VERTEX = /* glsl */ `
varying vec2 vPlane;
varying vec3 vWorld;
varying vec3 vCenter;

void main() {
  vPlane = position.xy;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const RING_FRAGMENT = /* glsl */ `
uniform float uLight;
uniform float uInner;
uniform float uOuter;
uniform float uRadius;
uniform vec3 uSun;
uniform vec3 uNear;
uniform vec3 uFar;
uniform vec3 uPaperNear;
uniform vec3 uPaperFar;

varying vec2 vPlane;
varying vec3 vWorld;
varying vec3 vCenter;

void main() {
  float t = (length(vPlane) - uInner) / (uOuter - uInner);

  float lanes = 0.6 + 0.4 * sin(t * 52.0 + sin(t * 9.0) * 2.0);
  float gap = smoothstep(0.015, 0.05, abs(t - 0.58));
  float edge = smoothstep(0.0, 0.07, t) * smoothstep(1.0, 0.82, t);

  // the planet throws its shadow across the far side of the ring
  vec3 offset = vWorld - vCenter;
  float along = dot(offset, uSun);
  float shadow = along < 0.0 ? smoothstep(uRadius * 0.9, uRadius * 1.05, length(offset - along * uSun)) : 1.0;

  vec3 space = mix(uNear, uFar, t) * (0.2 + 0.8 * shadow);
  vec3 paper = mix(uPaperNear, uPaperFar, t);

  float alpha = lanes * gap * edge * mix(0.56, 0.5, uLight);
  gl_FragColor = vec4(mix(space, paper, uLight) * alpha, alpha);
}
`;

/* -------------------------------------------------------------------------- */
/* Pieces                                                                     */
/* -------------------------------------------------------------------------- */

export type BodyPalette = {
  dark: string;
  bright: string;
  storm: string;
  rim: string;
  paperDark: string;
  paperBright: string;
  paperRim: string;
};

export type RingPalette = {
  near: string;
  far: string;
  paperNear: string;
  paperFar: string;
};

type BodyProps = {
  rig: RigRef;
  radius: number;
  /** Number of cloud bands; 0 gives a mottled, rocky surface. */
  bands: number;
  /** Rotation speed in radians per second. */
  spin: number;
  palette: BodyPalette;
};

function Body({ rig, radius, bands, spin, palette }: BodyProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);

  const parameters = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uLight: { value: 0 },
        uBands: { value: bands },
        uSun: { value: SUN_DIRECTION },
        uDark: { value: displayColor(palette.dark) },
        uBright: { value: displayColor(palette.bright) },
        uStorm: { value: displayColor(palette.storm) },
        uRim: { value: displayColor(palette.rim) },
        uPaperDark: { value: displayColor(palette.paperDark) },
        uPaperBright: { value: displayColor(palette.paperBright) },
        uPaperRim: { value: displayColor(palette.paperRim) },
      },
      vertexShader: BODY_VERTEX,
      fragmentShader: BODY_FRAGMENT,
      transparent: true,
      premultipliedAlpha: true,
    }),
    [bands, palette]
  );

  useFrame(() => {
    const { time, light } = rig.current;
    if (mesh.current) mesh.current.rotation.y = time * spin;

    const uniforms = material.current?.uniforms;
    if (!uniforms) return;
    uniforms.uTime.value = time;
    uniforms.uLight.value = light;
  });

  // Drawn before the stars (and writing depth) so everything behind it is hidden.
  return (
    <mesh ref={mesh} scale={radius} renderOrder={-5}>
      <sphereGeometry args={[1, 64, 48]} />
      <shaderMaterial ref={material} args={[parameters]} />
    </mesh>
  );
}

const HALO_SCALE = 1.18;

function Halo({ rig, radius, color }: { rig: RigRef; radius: number; color: string }) {
  const material = useRef<THREE.ShaderMaterial>(null);

  const parameters = useMemo(
    () => ({
      uniforms: {
        uLight: { value: 0 },
        uLimb: { value: Math.sqrt(1 - 1 / (HALO_SCALE * HALO_SCALE)) },
        uSun: { value: SUN_DIRECTION },
        uColor: { value: displayColor(color) },
      },
      vertexShader: HALO_VERTEX,
      fragmentShader: HALO_FRAGMENT,
      side: THREE.BackSide,
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
    }),
    [color]
  );

  useFrame(() => {
    const uniforms = material.current?.uniforms;
    if (uniforms) uniforms.uLight.value = rig.current.light;
  });

  return (
    <mesh scale={radius * HALO_SCALE} renderOrder={-4}>
      <sphereGeometry args={[1, 48, 32]} />
      <shaderMaterial ref={material} args={[parameters]} />
    </mesh>
  );
}

const RING_INNER = 1.45;
const RING_OUTER = 2.35;

function Ring({ rig, radius, palette }: { rig: RigRef; radius: number; palette: RingPalette }) {
  const material = useRef<THREE.ShaderMaterial>(null);

  const parameters = useMemo(
    () => ({
      uniforms: {
        uLight: { value: 0 },
        uInner: { value: RING_INNER },
        uOuter: { value: RING_OUTER },
        uRadius: { value: radius },
        uSun: { value: SUN_DIRECTION },
        uNear: { value: displayColor(palette.near) },
        uFar: { value: displayColor(palette.far) },
        uPaperNear: { value: displayColor(palette.paperNear) },
        uPaperFar: { value: displayColor(palette.paperFar) },
      },
      vertexShader: RING_VERTEX,
      fragmentShader: RING_FRAGMENT,
      side: THREE.DoubleSide,
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
    }),
    [radius, palette]
  );

  useFrame(() => {
    const uniforms = material.current?.uniforms;
    if (uniforms) uniforms.uLight.value = rig.current.light;
  });

  // The ring geometry lies flat in XY; turn it into the planet's equatorial plane.
  return (
    <mesh scale={radius} rotation={[Math.PI / 2, 0, 0]} renderOrder={-3}>
      <ringGeometry args={[RING_INNER, RING_OUTER, 128, 1]} />
      <shaderMaterial ref={material} args={[parameters]} />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/* Planet                                                                     */
/* -------------------------------------------------------------------------- */

type Moon = {
  /** Orbit radius and size, both in planet radii. */
  distance: number;
  size: number;
  /** Orbit speed in radians per second. */
  speed: number;
  palette: BodyPalette;
};

type PlanetProps = BodyProps & {
  position: [number, number, number];
  /** Axial tilt of the planet, its ring and its moon's orbit. */
  tilt: [number, number, number];
  halo?: string;
  ring?: RingPalette;
  moon?: Moon;
};

export default function Planet({ rig, position, tilt, radius, bands, spin, palette, halo, ring, moon }: PlanetProps) {
  const orbit = useRef<THREE.Group>(null);
  const moonSpeed = moon?.speed ?? 0;

  useFrame(() => {
    if (orbit.current) orbit.current.rotation.y = rig.current.time * moonSpeed;
  });

  return (
    <group position={position} rotation={tilt}>
      <Body rig={rig} radius={radius} bands={bands} spin={spin} palette={palette} />
      {halo && <Halo rig={rig} radius={radius} color={halo} />}
      {ring && <Ring rig={rig} radius={radius} palette={ring} />}
      {moon && (
        <group ref={orbit}>
          <group position={[moon.distance * radius, 0, 0]}>
            <Body rig={rig} radius={moon.size * radius} bands={0} spin={0.2} palette={moon.palette} />
          </group>
        </group>
      )}
    </group>
  );
}
