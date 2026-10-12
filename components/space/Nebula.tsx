"use client";

import { useMemo, useRef } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import * as THREE from "three";
import { NOISE_GLSL, displayColor, type RigRef } from "./shared";

// Both passes draw a quad that already covers the screen — no camera involved.
const SCREEN_VERTEX = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  // z = w pins the quad to the far plane, so planets and rocks draw in front of it
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

const GAS_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uAspect;
uniform float uLight;
uniform vec2 uDrift;
uniform vec3 uTeal;
uniform vec3 uViolet;
uniform vec3 uMagenta;
uniform vec3 uWashA;
uniform vec3 uWashB;

varying vec2 vUv;

${NOISE_GLSL}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.3 + uDrift;
  float t = uTime * 0.016;

  // domain-warped fbm → wispy gas that churns slowly
  vec2 warp = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  float gas = fbm(p + 2.2 * warp + vec2(t * 0.5, 0.0));
  float veil = fbm(p * 0.5 - warp * 0.8 + 7.0);

  float density = smoothstep(0.36, 0.82, gas) * (0.3 + 0.7 * smoothstep(0.25, 0.7, veil));

  vec3 space = mix(uTeal, uViolet, smoothstep(0.3, 0.7, warp.x));
  space = mix(space, uMagenta, smoothstep(0.5, 0.85, veil) * 0.6);
  space *= 0.75 + 0.9 * smoothstep(0.6, 0.95, gas);

  // on white the same gas reads as a faint watercolour wash
  vec3 wash = mix(uWashA, uWashB, smoothstep(0.3, 0.7, warp.y));

  float alpha = density * mix(0.42, 0.5, uLight);
  gl_FragColor = vec4(mix(space, wash, uLight) * alpha, alpha * uLight);
}
`;

const SCREEN_FRAGMENT = /* glsl */ `
uniform sampler2D uMap;

varying vec2 vUv;

void main() {
  vec4 gas = texture2D(uMap, vUv);
  // a little noise hides banding in the smooth gradients
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  gl_FragColor = vec4(gas.rgb + grain * (1.5 / 255.0), gas.a);
}
`;

/**
 * Drifting nebula. The fbm noise is expensive per pixel, and the result is soft
 * anyway, so it is rendered into a small off-screen texture and stretched across
 * the screen — the cost stays the same on a phone and on a 4K monitor.
 */
export default function Nebula({ rig, aspect }: { rig: RigRef; aspect: number }) {
  const landscape = aspect >= 1;
  const precise = useThree(
    ({ gl }) => gl.extensions.has("EXT_color_buffer_float") || gl.extensions.has("EXT_color_buffer_half_float")
  );
  const target = useFBO(landscape ? 640 : 360, landscape ? 360 : 640, {
    depthBuffer: false,
    type: precise ? THREE.HalfFloatType : THREE.UnsignedByteType,
  });

  const gasMaterial = useRef<THREE.ShaderMaterial>(null);

  const offscreen = useMemo(
    () => ({ scene: new THREE.Scene(), camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1) }),
    []
  );

  const gasParameters = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uLight: { value: 0 },
        uDrift: { value: new THREE.Vector2() },
        uTeal: { value: displayColor("#14b890") },
        uViolet: { value: displayColor("#5b46e0") },
        uMagenta: { value: displayColor("#b83d8f") },
        uWashA: { value: displayColor("#a9e6c6") },
        uWashB: { value: displayColor("#bcc6ff") },
      },
      vertexShader: SCREEN_VERTEX,
      fragmentShader: GAS_FRAGMENT,
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false,
    }),
    []
  );

  const screenParameters = useMemo(
    () => ({
      uniforms: { uMap: { value: target.texture } },
      vertexShader: SCREEN_VERTEX,
      fragmentShader: SCREEN_FRAGMENT,
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
    }),
    [target]
  );

  useFrame(({ gl }) => {
    const uniforms = gasMaterial.current?.uniforms;
    if (!uniforms) return;

    const { time, light, scroll, pointerX, pointerY } = rig.current;
    uniforms.uTime.value = time;
    uniforms.uLight.value = light;
    uniforms.uAspect.value = aspect;
    // the gas slides past more slowly than the page — a deep parallax layer
    uniforms.uDrift.value.set(pointerX * 0.03, pointerY * 0.03 - scroll * 0.55);

    gl.setRenderTarget(target);
    gl.render(offscreen.scene, offscreen.camera);
    gl.setRenderTarget(null);
  });

  return (
    <>
      {createPortal(
        <mesh frustumCulled={false}>
          <planeGeometry args={[2, 2]} />
          <shaderMaterial ref={gasMaterial} args={[gasParameters]} />
        </mesh>,
        offscreen.scene
      )}

      <mesh frustumCulled={false} renderOrder={-10}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial args={[screenParameters]} />
      </mesh>
    </>
  );
}
