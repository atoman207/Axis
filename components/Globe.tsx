"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";

function GlobeMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.08;
      meshRef.current.rotation.x = Math.sin(t * 0.05) * 0.05;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = t * 0.05;
      wireRef.current.rotation.x = Math.sin(t * 0.04) * 0.06;
    }
  });

  return (
    <>
      {/* Main globe — deep forest-green base */}
      <Sphere ref={meshRef} args={[1.4, 64, 64]}>
        <MeshDistortMaterial
          color="#07160f"
          attach="material"
          distort={0.15}
          speed={1.5}
          roughness={0.1}
          metalness={0.9}
          envMapIntensity={0.5}
        />
      </Sphere>

      {/* Emerald wireframe overlay */}
      <Sphere ref={wireRef} args={[1.42, 24, 24]}>
        <meshBasicMaterial color="#5691fb" wireframe transparent opacity={0.13} />
      </Sphere>

      {/* Outer glow shell */}
      <Sphere args={[1.62, 32, 32]}>
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.04} side={THREE.BackSide} />
      </Sphere>
    </>
  );
}

function NetworkDots() {
  const POINTS = 80;
  const groupRef = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(POINTS * 3);
    const colors    = new Float32Array(POINTS * 3);
    const cyan      = new THREE.Color("#5691fb");
    const sky       = new THREE.Color("#7dd3fc");

    for (let i = 0; i < POINTS; i++) {
      const phi   = Math.acos(-1 + (2 * i) / POINTS);
      const theta = Math.sqrt(POINTS * Math.PI) * phi;
      const r = 1.47;
      positions[i * 3]     = r * Math.cos(theta) * Math.sin(phi);
      positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const col = i % 3 === 0 ? cyan : sky;
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
    if (groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * 0.06;
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <pointsMaterial size={0.025} vertexColors transparent opacity={0.85} sizeAttenuation />
      </points>
    </group>
  );
}

export default function GlobeCanvas() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]}   intensity={0.9} color="#5691fb" />
        <directionalLight position={[-5, -3, -5]} intensity={0.4} color="#38bdf8" />
        <pointLight       position={[0, 0, 4]}    intensity={1.2} color="#7dd3fc" distance={8} />

        <Stars radius={8} depth={50} count={1200} factor={3} saturation={0.3} fade speed={0.4} />

        <GlobeMesh />
        <NetworkDots />
      </Canvas>
    </div>
  );
}
