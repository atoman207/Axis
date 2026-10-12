import type { RefObject } from "react";
import * as THREE from "three";

/**
 * Per-frame values shared by every part of the space scene.
 * Written once per frame by the camera rig, read by everything else.
 */
export type Rig = {
  /** Seconds of animation time (stays at 0 when motion is reduced). */
  time: number;
  /** Page scroll progress, 0 (top) → 1 (bottom), eased. */
  scroll: number;
  /** Mouse position, -1 → 1 on both axes, eased. */
  pointerX: number;
  pointerY: number;
  /** Theme blend: 0 = space, 1 = white. Eased so the sky cross-fades. */
  light: number;
};

export type RigRef = RefObject<Rig>;

export const CAMERA_FOV = 55;
export const CAMERA_Z = 12;

/** Deterministic PRNG (mulberry32) — the same sky on every render and every visit. */
export function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The scene's shaders work in display (sRGB) space and write straight to the
 * canvas, so their colours are stored exactly as authored — no linear conversion.
 */
export function displayColor(hex: string) {
  return new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace);
}

/**
 * World position for something pinned to a spot on screen (at scroll 0).
 * `x` / `y` are -1 → 1 across the viewport, `depth` is the distance from the camera.
 */
export function anchor(x: number, y: number, depth: number, aspect: number): [number, number, number] {
  const halfHeight = Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)) * depth;
  return [x * halfHeight * aspect, y * halfHeight, CAMERA_Z - depth];
}

/** GLSL value noise + fbm, shared by the nebula and the planets. */
export const NOISE_GLSL = /* glsl */ `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotate = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise2(p);
    p = rotate * p;
    amplitude *= 0.5;
  }
  return value;
}

float hash31(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(
      mix(hash31(i), hash31(i + vec3(1.0, 0.0, 0.0)), u.x),
      mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), u.x),
      u.y
    ),
    mix(
      mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), u.x),
      mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.0, 1.0)), u.x),
      u.y
    ),
    u.z
  );
}
`;
