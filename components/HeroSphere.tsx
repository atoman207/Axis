"use client";

import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Sphere, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "@/components/PreferencesProvider";
import type { Theme } from "@/lib/preferences/config";

/**
 * Official stack icons — mirrors the skill set shown in Technology.tsx.
 * Sourced from the Devicon CDN (colored, official brand SVGs). A few marks
 * ship near-black by default, so those use a light/colored Simple Icons
 * variant instead so they stay visible against the dark hero background
 * (`lightSrc` is the dark original, used on the white background).
 */
const STACKS = [
  { name: "React", src: devicon("react/react-original.svg") },
  { name: "Next.js", src: simpleIcon("nextdotjs", "FFFFFF"), lightSrc: simpleIcon("nextdotjs", "000000") },
  { name: "TypeScript", src: devicon("typescript/typescript-original.svg") },
  { name: "Python", src: devicon("python/python-original.svg") },
  { name: "FastAPI", src: devicon("fastapi/fastapi-original.svg") },
  { name: "Node.js", src: devicon("nodejs/nodejs-original.svg") },
  { name: "Laravel", src: devicon("laravel/laravel-original.svg") },
  { name: "Java", src: devicon("java/java-original.svg") },
  { name: "AWS", src: devicon("amazonwebservices/amazonwebservices-original-wordmark.svg"), wide: true },
  { name: "Azure", src: devicon("azure/azure-original.svg") },
  { name: "Docker", src: devicon("docker/docker-original.svg") },
  { name: "PostgreSQL", src: devicon("postgresql/postgresql-original.svg") },
  { name: "MongoDB", src: devicon("mongodb/mongodb-original.svg") },
  { name: "Redis", src: devicon("redis/redis-original.svg") },
  { name: "OpenAI", src: "", isOpenAI: true },
  { name: "Claude", src: simpleIcon("anthropic", "D4A27F") },
  { name: "Gemini", src: simpleIcon("googlegemini", "8E75F0") },
  { name: "GitHub", src: simpleIcon("github", "FFFFFF"), lightSrc: simpleIcon("github", "181717") },
  { name: "Terraform", src: devicon("terraform/terraform-original.svg") },
  { name: "Kubernetes", src: devicon("kubernetes/kubernetes-plain.svg") },
] as const;

function devicon(path: string) {
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${path}`;
}

function simpleIcon(slug: string, hex: string) {
  return `https://cdn.simpleicons.org/${slug}/${hex}`;
}

/** OpenAI's mark ships colorless from the CDN, so it's inlined to set its brand teal. */
function OpenAIMark() {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} fill="#74AA9C" style={{ display: "block" }}>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Earth                                                                     */
/* -------------------------------------------------------------------------- */

const EARTH_MAP =
  "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg";
const EARTH_SPECULAR =
  "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg";
const EARTH_CLOUDS =
  "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png";

function EarthGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  const [map, specularMap, cloudsMap] = useTexture([EARTH_MAP, EARTH_SPECULAR, EARTH_CLOUDS]);

  useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    cloudsMap.colorSpace = THREE.SRGBColorSpace;
  }, [map, cloudsMap]);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.16;
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.22;
    if (wireRef.current) wireRef.current.rotation.y -= delta * 0.05;
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[1.35, 96, 96]}>
        <meshPhongMaterial map={map} specularMap={specularMap} specular={new THREE.Color("#eaf6ff")} shininess={18} />
      </Sphere>

      <Sphere ref={cloudRef} args={[1.372, 96, 96]}>
        <meshLambertMaterial map={cloudsMap} transparent opacity={0.55} depthWrite={false} />
      </Sphere>

      <Sphere ref={wireRef} args={[1.4, 26, 26]}>
        <meshBasicMaterial color="#5691fb" wireframe transparent opacity={0.1} depthWrite={false} />
      </Sphere>

      <Sphere args={[1.56, 32, 32]}>
        <meshBasicMaterial color="#8ab6ff" transparent opacity={0.09} side={THREE.BackSide} />
      </Sphere>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Orbit rings + icons — full spherical coverage                             */
/* Equatorial, polar, and many diagonal planes so no region of Earth is bare */
/* -------------------------------------------------------------------------- */

type OrbitPlane = {
  radius: number;
  /** Inclination from the equatorial (XZ) plane */
  inclination: number;
  /** Longitude of ascending node — rotates the orbit around Y */
  node: number;
  color: string;
};

const ORBIT_PLANES: OrbitPlane[] = [
  { radius: 2.02, inclination: 0, node: 0, color: "#5691fb" }, // equatorial (horizontal)
  { radius: 2.08, inclination: Math.PI / 2, node: 0, color: "#8ab6ff" }, // polar meridian
  { radius: 2.14, inclination: Math.PI / 2, node: Math.PI / 2, color: "#38bdf8" }, // polar orthogonal
  { radius: 2.22, inclination: 0.52, node: 0.35, color: "#2f6ff2" },
  { radius: 2.28, inclination: 0.9, node: 1.05, color: "#7dd3fc" },
  { radius: 2.34, inclination: 1.2, node: 1.9, color: "#0284c7" },
  { radius: 2.4, inclination: -0.65, node: 0.75, color: "#1a56db" },
  { radius: 2.46, inclination: 0.38, node: 2.4, color: "#b8d3ff" },
  { radius: 2.52, inclination: 1.05, node: 3.2, color: "#bae6fd" },
  { radius: 2.58, inclination: -1.1, node: 1.55, color: "#153b91" },
];

/** Map a circular equatorial path into an inclined / noded orbit plane. */
function orbitPoint(
  angle: number,
  radius: number,
  inclination: number,
  node: number
): [number, number, number] {
  const x0 = Math.cos(angle) * radius;
  const z0 = Math.sin(angle) * radius;

  const cosI = Math.cos(inclination);
  const sinI = Math.sin(inclination);
  const y1 = -z0 * sinI;
  const z1 = z0 * cosI;

  const cosN = Math.cos(node);
  const sinN = Math.sin(node);
  return [x0 * cosN + z1 * sinN, y1, -x0 * sinN + z1 * cosN];
}

function OrbitRing({ plane }: { plane: OrbitPlane }) {
  // Torus lies in XY by default; rotate into the orbital plane.
  return (
    <mesh rotation={[Math.PI / 2 + plane.inclination, plane.node, 0]}>
      <torusGeometry args={[plane.radius, 0.0055, 10, 140]} />
      <meshBasicMaterial color={plane.color} transparent opacity={0.36} depthWrite={false} />
    </mesh>
  );
}

type OrbitSkill = (typeof STACKS)[number] & {
  radius: number;
  inclination: number;
  node: number;
  speed: number;
  phase: number;
  spin: number;
};

function OrbitingIcon({ skill, theme }: { skill: OrbitSkill; theme: Theme }) {
  const groupRef = useRef<THREE.Group>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const isWide = "wide" in skill && skill.wide;
  const isOpenAI = "isOpenAI" in skill && skill.isOpenAI;
  const size = isWide ? 40 : 26;
  const src = theme === "light" && "lightSrc" in skill ? skill.lightSrc : skill.src;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const angle = clock.getElapsedTime() * skill.speed + skill.phase;
    const [x, y, z] = orbitPoint(angle, skill.radius, skill.inclination, skill.node);
    groupRef.current.position.set(x, y, z);

    if (iconRef.current) {
      iconRef.current.style.transform = `rotate(${clock.getElapsedTime() * skill.spin * 57.3}deg)`;
    }
  });

  return (
    <group ref={groupRef}>
      <Html
        center
        distanceFactor={8}
        style={{ pointerEvents: "none", userSelect: "none", overflow: "visible", background: "transparent" }}
        zIndexRange={[60, 0]}
      >
        <div
          ref={iconRef}
          title={skill.name}
          style={{
            width: size,
            height: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            filter: `drop-shadow(0 2px 7px rgba(0,0,0,${theme === "light" ? 0.18 : 0.6}))`,
          }}
        >
          {isOpenAI ? (
            <OpenAIMark />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={skill.name}
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "contain", background: "transparent" }}
            />
          )}
        </div>
      </Html>
    </group>
  );
}

function OrbitingStacks({ theme }: { theme: Theme }) {
  // Two icons per plane where possible, evenly phased, each with a unique speed.
  const skills = useMemo<OrbitSkill[]>(
    () =>
      STACKS.map((s, i) => {
        const plane = ORBIT_PLANES[i % ORBIT_PLANES.length];
        const direction = i % 2 === 0 ? 1 : -1;
        // Distinct angular speeds so no two icons crawl in lockstep
        const speed = direction * (0.15 + ((i * 0.041) % 0.62));
        // Stagger start angles across the full circle of each plane
        const peersOnPlane = Math.ceil(STACKS.length / ORBIT_PLANES.length);
        const slotOnPlane = Math.floor(i / ORBIT_PLANES.length);
        const phase =
          (slotOnPlane / peersOnPlane) * Math.PI * 2 + (i % ORBIT_PLANES.length) * 0.17;

        return {
          ...s,
          radius: plane.radius,
          inclination: plane.inclination,
          node: plane.node,
          speed,
          phase,
          spin: 0.35 + (i % 5) * 0.18,
        };
      }),
    []
  );

  return (
    <group>
      {ORBIT_PLANES.map((plane, i) => (
        <OrbitRing key={`ring-${i}`} plane={plane} />
      ))}
      {skills.map((skill) => (
        <OrbitingIcon key={skill.name} skill={skill} theme={theme} />
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Responsive framing                                                        */
/* -------------------------------------------------------------------------- */

const MAX_EXTENT = 2.58 + 0.5;
const CAMERA_DISTANCE = 7.0;
const FIT_MARGIN = 1.28;

function ResponsiveRig() {
  const { size, camera } = useThree();

  useLayoutEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const limitingAspect = Math.min(1, aspect);
    const vFovRad = 2 * Math.atan((MAX_EXTENT * FIT_MARGIN) / (CAMERA_DISTANCE * limitingAspect));
    const vFovDeg = THREE.MathUtils.clamp((vFovRad * 180) / Math.PI, 22, 82);

    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = vFovDeg;
    cam.aspect = aspect;
    cam.position.set(0, 0.1, CAMERA_DISTANCE);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }, [size, camera]);

  return null;
}

function Scene({ theme }: { theme: Theme }) {
  const rootRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!rootRef.current) return;
    rootRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.7) * 0.05;
  });

  return (
    <>
      <ResponsiveRig />
      {/* white points of light only read against the dark sky */}
      {theme === "space" && (
        <Stars radius={60} depth={40} count={3200} factor={2.4} saturation={0} fade speed={0.35} />
      )}

      <group ref={rootRef}>
        {/* on white, lift the night side so the globe doesn't read as a black disc */}
        <ambientLight intensity={theme === "light" ? 1.6 : 0.55} />
        <directionalLight position={[4, 3, 5]} intensity={1.35} color="#eaf3ff" />
        <directionalLight position={[-3, -2, -4]} intensity={0.35} color="#5691fb" />
        <pointLight position={[0, 0, 3.5]} intensity={0.8} color="#38bdf8" distance={10} />

        <Suspense fallback={null}>
          <EarthGlobe />
        </Suspense>
        <OrbitingStacks theme={theme} />
      </group>
    </>
  );
}

export default function HeroSphere() {
  // read outside the canvas: <Html> content renders in its own React root
  const { theme } = useTheme();

  return (
    <Canvas
      camera={{ position: [0, 0.1, CAMERA_DISTANCE], fov: 42, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.75]}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      <Scene theme={theme} />
    </Canvas>
  );
}
