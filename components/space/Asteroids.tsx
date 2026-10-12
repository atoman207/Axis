"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createRandom, type RigRef } from "./shared";

// The slab of space the rocks drift through; they wrap around at its ends.
const SPAN_X = 52;
const SPAN_Y = 26;
const NEAR_Z = 2;
const FAR_Z = -34;

type Rock = {
  x: number;
  y: number;
  z: number;
  /** Drift along x in units per second. */
  drift: number;
  /** Tumble axis and speed. */
  axis: THREE.Vector3;
  tumble: number;
  scale: THREE.Vector3;
};

function createRocks(count: number): Rock[] {
  const random = createRandom(4861);

  return Array.from({ length: count }, () => {
    const size = 0.1 + Math.pow(random(), 3) * 0.42;
    return {
      x: (random() - 0.5) * SPAN_X,
      y: (random() - 0.5) * SPAN_Y,
      z: FAR_Z + random() * (NEAR_Z - FAR_Z),
      drift: 0.12 + random() * 0.28,
      axis: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize(),
      tumble: 0.1 + random() * 0.5,
      // squashed unevenly so no two low-poly rocks look alike
      scale: new THREE.Vector3(size * (0.7 + random() * 0.6), size * (0.6 + random() * 0.5), size * (0.7 + random() * 0.6)),
    };
  });
}

const SPACE_ROCK = new THREE.Color("#5d6478");
const PAPER_ROCK = new THREE.Color("#c4d3cb");
const transform = new THREE.Object3D();

/** A sparse field of tumbling low-poly rocks drifting across the view. */
export default function Asteroids({ rig, count }: { rig: RigRef; count: number }) {
  const mesh = useRef<THREE.InstancedMesh<THREE.IcosahedronGeometry, THREE.MeshStandardMaterial>>(null);
  const rocks = useMemo(() => createRocks(count), [count]);

  useFrame(() => {
    const instances = mesh.current;
    if (!instances) return;
    const { time, light } = rig.current;

    rocks.forEach((rock, i) => {
      const travelled = rock.x + SPAN_X / 2 + time * rock.drift;
      transform.position.set((travelled % SPAN_X) - SPAN_X / 2, rock.y + Math.sin(time * 0.2 + i) * 0.3, rock.z);
      transform.quaternion.setFromAxisAngle(rock.axis, time * rock.tumble + i);
      transform.scale.copy(rock.scale);
      transform.updateMatrix();
      instances.setMatrixAt(i, transform.matrix);
    });
    instances.instanceMatrix.needsUpdate = true;

    instances.material.color.lerpColors(SPACE_ROCK, PAPER_ROCK, light);
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial flatShading roughness={0.95} metalness={0.05} />
    </instancedMesh>
  );
}
