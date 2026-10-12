"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA_FOV, CAMERA_Z, displayColor, type RigRef } from "./shared";

const VERTEX = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
uniform float uFade;
uniform float uLight;
uniform vec3 uGlow;
uniform vec3 uInk;

varying vec2 vUv;

void main() {
  float along = vUv.x;                       // 0 at the tail → 1 at the head
  float across = abs(vUv.y - 0.5) * 2.0;

  float tail = pow(along, 2.6) * (1.0 - smoothstep(0.0, 1.0, across));
  float head = exp(-pow((1.0 - along) * 26.0, 2.0)) * exp(-across * across * 3.0);

  float alpha = (tail * 0.75 + head) * uFade * mix(1.0, 0.55, uLight);
  gl_FragColor = vec4(mix(uGlow, uInk, uLight) * alpha, alpha * uLight);
}
`;

const COUNT = 3;
const DEPTH = 34;
const THICKNESS = 0.1;

type Meteor = {
  /** Seconds until the next launch. */
  wait: number;
  /** Seconds since launch. */
  age: number;
  duration: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
};

function launch(meteor: Meteor, halfWidth: number, halfHeight: number) {
  // enter somewhere in the upper sky and streak down to the left
  meteor.angle = Math.PI * (1.08 + Math.random() * 0.14);
  meteor.x = (Math.random() * 1.5 - 0.3) * halfWidth;
  meteor.y = (0.25 + Math.random() * 0.75) * halfHeight;
  meteor.speed = 24 + Math.random() * 18;
  meteor.length = 5 + Math.random() * 6;
  meteor.duration = 0.7 + Math.random() * 0.5;
  meteor.age = 0;
}

/** Occasional meteors: each waits a random while, streaks across the sky, and resets. */
export default function ShootingStars({ rig, aspect }: { rig: RigRef; aspect: number }) {
  const meshes = useRef<(THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null)[]>([]);
  const meteors = useRef<Meteor[]>([]);
  const lastTime = useRef(0);

  // One material per meteor — each fades on its own schedule.
  const parameters = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        uniforms: {
          uFade: { value: 0 },
          uLight: { value: 0 },
          uGlow: { value: displayColor("#dff6ff") },
          uInk: { value: displayColor("#1a56db") },
        },
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
      })),
    []
  );

  useFrame(() => {
    const { time, light } = rig.current;
    const delta = time - lastTime.current;
    lastTime.current = time;

    if (meteors.current.length === 0) {
      meteors.current = Array.from({ length: COUNT }, (_, i) => ({
        wait: 1.5 + i * 3.5 + Math.random() * 3,
        age: 0,
        duration: 1,
        x: 0,
        y: 0,
        angle: 0,
        speed: 0,
        length: 0,
      }));
    }

    const halfHeight = Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)) * DEPTH;
    const halfWidth = halfHeight * aspect;

    meteors.current.forEach((meteor, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;

      if (meteor.wait > 0) {
        meteor.wait -= delta;
        mesh.visible = false;
        if (meteor.wait <= 0) launch(meteor, halfWidth, halfHeight);
        return;
      }

      meteor.age += delta;
      const life = meteor.age / meteor.duration;
      if (life >= 1) {
        meteor.wait = 4 + Math.random() * 9;
        mesh.visible = false;
        return;
      }

      const travelled = meteor.age * meteor.speed;
      const directionX = Math.cos(meteor.angle);
      const directionY = Math.sin(meteor.angle);

      // the quad trails behind the head, so centre it half a length back
      mesh.visible = true;
      mesh.position.set(
        meteor.x + directionX * (travelled - meteor.length / 2),
        meteor.y + directionY * (travelled - meteor.length / 2),
        CAMERA_Z - DEPTH
      );
      mesh.rotation.z = meteor.angle;
      mesh.scale.set(meteor.length, THICKNESS, 1);

      mesh.material.uniforms.uFade.value = Math.sin(Math.PI * life);
      mesh.material.uniforms.uLight.value = light;
    });
  });

  return (
    <>
      {parameters.map((materialParameters, i) => (
        <mesh
          key={i}
          ref={(mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null) => {
            meshes.current[i] = mesh;
          }}
          visible={false}
        >
          <planeGeometry args={[1, 1]} />
          <shaderMaterial args={[materialParameters]} />
        </mesh>
      ))}
    </>
  );
}
