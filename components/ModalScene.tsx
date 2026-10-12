"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* --- Rotating wireframe ring --- */
interface RingProps {
  radius: number;
  tube: number;
  speed: number;
  color: string;
  initRot: [number, number, number];
  opacity?: number;
}

function Ring({ radius, tube, speed, color, initRot, opacity = 0.55 }: RingProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x += 0.004 * speed;
    ref.current.rotation.y += 0.006 * speed;
    ref.current.rotation.z += 0.002 * speed;
  });

  return (
    <mesh ref={ref} rotation={initRot}>
      <torusGeometry args={[radius, tube, 20, 140]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

/* --- Drifting particles --- */
function ModalParticles({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 200;

  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 2.5 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.04;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.04}
        color={color}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

interface ModalSceneProps {
  color?: string;
}

export default function ModalScene({ color = "#5691fb" }: ModalSceneProps) {
  const rings: RingProps[] = [
    { radius: 2.4, tube: 0.007, speed: 1.0, color, initRot: [0.4,  0.6,  0.0], opacity: 0.6  },
    { radius: 1.7, tube: 0.005, speed: 1.6, color, initRot: [-0.3, 0.9,  0.4], opacity: 0.4  },
    { radius: 3.0, tube: 0.004, speed: 0.7, color, initRot: [0.7, -0.4,  0.8], opacity: 0.3  },
    { radius: 2.0, tube: 0.006, speed: 1.2, color, initRot: [-0.5, 0.2, -0.6], opacity: 0.45 },
  ];

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <ModalParticles color={color} />
      {rings.map((r, i) => (
        <Ring key={i} {...r} />
      ))}
    </Canvas>
  );
}
