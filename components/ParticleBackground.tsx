"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 900;

function StarField() {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);

    const skyBlue = new THREE.Color("#5691fb");
    const cyan = new THREE.Color("#38bdf8");
    const white = new THREE.Color("#eafff1");

    for (let i = 0; i < COUNT; i++) {
      // Spread across a wide 3-D volume
      positions[i * 3]     = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Vary colour: mostly sky-blue, some cyan, a few white
      const pick = Math.random();
      const col = pick < 0.55 ? skyBlue : pick < 0.85 ? cyan : white;
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color",    new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.006;
    ref.current.rotation.x = Math.sin(t * 0.003) * 0.015;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.055}
        vertexColors
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function NebulaCloud({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Points>(null);
  const CLOUD = 120;

  const geometry = useMemo(() => {
    const positions = new Float32Array(CLOUD * 3);
    const col = new THREE.Color(color);
    const colors = new Float32Array(CLOUD * 3);
    for (let i = 0; i < CLOUD; i++) {
      const r = Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
      positions[i * 3 + 2] = r * Math.cos(phi);
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color",    new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [color]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.012;
  });

  return (
    <points ref={ref} geometry={geometry} position={position}>
      <pointsMaterial
        size={0.09}
        vertexColors
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function ParticleScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 65 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
      dpr={[0.6, 1]}
    >
      <StarField />
      <NebulaCloud position={[-8,  4, -5]} color="#1a56db" />
      <NebulaCloud position={[ 8, -3, -6]} color="#38bdf8" />
    </Canvas>
  );
}

export default ParticleScene;
