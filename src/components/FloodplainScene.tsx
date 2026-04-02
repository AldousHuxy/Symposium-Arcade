import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Houses: [x, z, terrainY]. Flooded when waterLevel > terrainY + 0.05 */
const HOUSES: Array<{ x: number; z: number; ground: number; zone: '100yr' | '500yr' | 'safe' }> = [
  { x: -3.5, z: -3,  ground: 0.42, zone: '100yr' },
  { x:  3.8, z: -2,  ground: 0.38, zone: '100yr' },
  { x: -3.2, z:  3,  ground: 0.40, zone: '100yr' },
  { x:  4.1, z:  4,  ground: 0.45, zone: '100yr' },
  { x: -7.2, z: -4,  ground: 1.10, zone: '500yr' },
  { x:  7.0, z:  2,  ground: 1.05, zone: '500yr' },
  { x: -7.5, z:  5,  ground: 1.15, zone: '500yr' },
  { x:  7.3, z: -5,  ground: 1.08, zone: '500yr' },
  { x: -12,  z: -4,  ground: 2.65, zone: 'safe' },
  { x:  12,  z:  3,  ground: 2.70, zone: 'safe' },
  { x: -11,  z:  5,  ground: 2.55, zone: 'safe' },
  { x:  11,  z: -3,  ground: 2.60, zone: 'safe' },
];

// ─── Terrain ──────────────────────────────────────────────────────────────────

/** Valley profile: returns Y height given distance from centre (x) */
function valleyHeight(x: number): number {
  const ax = Math.abs(x);
  if (ax <= 1.5)  return -2.0 + (ax / 1.5) * 0.3;           // channel
  if (ax <= 2.5)  return -1.7 + ((ax - 1.5) / 1.0) * 2.0;   // steep bank
  if (ax <= 6.0)  return 0.3  + ((ax - 2.5) / 3.5) * 0.4;   // 100-yr floodplain
  if (ax <= 10.0) return 0.7  + ((ax - 6.0) / 4.0) * 1.0;   // 500-yr zone
  return 1.7  + ((ax - 10.0) / 5.0) * 2.0;                  // upland hillside
}

function zoneColor(x: number): THREE.Color {
  const ax = Math.abs(x);
  if (ax <= 1.5)  return new THREE.Color('#8b7e66');           // channel sandy-brown
  if (ax <= 2.5)  return new THREE.Color('#5a7d4a');           // riparian green
  if (ax <= 6.0)  return new THREE.Color('#6b8e5a');           // 100-yr light green
  if (ax <= 10.0) return new THREE.Color('#7d9e6a');           // 500-yr lighter green
  return new THREE.Color('#4a7a3a');                           // upland dark green
}

function Terrain() {
  const geo = useMemo(() => {
    const segsX = 200;
    const segsZ = 100;
    const width  = 32;
    const depth  = 22;
    const g = new THREE.PlaneGeometry(width, depth, segsX, segsZ);
    g.rotateX(-Math.PI / 2);

    const pos    = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const noise  = (x: number, z: number) =>
      Math.sin(x * 1.3) * 0.06 + Math.cos(z * 0.9) * 0.07 + Math.sin(x * 2.8 + z) * 0.03;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = valleyHeight(x) + noise(x, z);
      pos.setY(i, y);
      const c = zoneColor(x);
      // slightly vary brightness along Z
      const bright = 0.88 + Math.sin(z * 0.5) * 0.06;
      colors[i * 3]     = c.r * bright;
      colors[i * 3 + 1] = c.g * bright;
      colors[i * 3 + 2] = c.b * bright;
    }
    pos.needsUpdate = true;
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} receiveShadow>
      <meshLambertMaterial vertexColors side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Water ────────────────────────────────────────────────────────────────────

interface WaterProps { targetLevel: number }

function Water({ targetLevel }: WaterProps) {
  const meshRef       = useRef<THREE.Mesh>(null);
  const currentLevel  = useRef(targetLevel);
  const time          = useRef(0);

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(32, 22, 60, 40);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  useEffect(() => {
    // no-op: targetLevel changes are picked up each frame via lerp
  }, [targetLevel]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    time.current += delta;
    currentLevel.current = THREE.MathUtils.lerp(currentLevel.current, targetLevel, delta * 2.5);
    meshRef.current.position.y = currentLevel.current;

    // gentle vertex ripples
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const wave = Math.sin(x * 0.8 + time.current * 1.2) * 0.025
                 + Math.cos(z * 0.9 + time.current * 0.9) * 0.020
                 + Math.sin((x + z) * 0.5 + time.current * 0.6) * 0.012;
      pos.setY(i, wave);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geo}>
      <meshPhysicalMaterial
        color="#567d99"
        transparent
        opacity={0.75}
        metalness={0.1}
        roughness={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Flood Zone Overlays ──────────────────────────────────────────────────────

function FloodZoneOverlays() {
  return (
    <group>
      {/* 100-yr zone band */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.38, 0]}>
        <planeGeometry args={[7.0, 22]} />
        <meshBasicMaterial color="#2255cc" transparent opacity={0.13} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* 500-yr zone — left flank */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8.0, 1.0, 0]}>
        <planeGeometry args={[4.0, 22]} />
        <meshBasicMaterial color="#cc7722" transparent opacity={0.11} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* 500-yr zone — right flank */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.0, 1.0, 0]}>
        <planeGeometry args={[4.0, 22]} />
        <meshBasicMaterial color="#cc7722" transparent opacity={0.11} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Structures ───────────────────────────────────────────────────────────────

interface HouseProps {
  position: [number, number, number];
  flooded: boolean;
  zone: '100yr' | '500yr' | 'safe';
}

const ZONE_COLORS: Record<string, string> = {
  '100yr': '#d4a020',
  '500yr': '#c06020',
  safe:    '#dddddd',
};

function House({ position, flooded, zone }: HouseProps) {
  const wallColor = flooded ? '#cc2222' : ZONE_COLORS[zone];
  const roofColor = flooded ? '#991111' : '#8b4513';
  const y = position[1];

  return (
    <group position={[position[0], y, position[2]]}>
      {/* walls */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshLambertMaterial color={wallColor} />
      </mesh>
      {/* roof */}
      <mesh castShadow position={[0, 1.225, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.72, 0.65, 4]} />
        <meshLambertMaterial color={roofColor} />
      </mesh>
      {/* chimney */}
      <mesh castShadow position={[0.2, 1.38, -0.1]}>
        <boxGeometry args={[0.14, 0.28, 0.14]} />
        <meshLambertMaterial color="#888" />
      </mesh>
    </group>
  );
}

function Structures({ waterLevel }: { waterLevel: number }) {
  return (
    <group>
      {HOUSES.map((h, i) => (
        <House
          key={i}
          position={[h.x, h.ground, h.z]}
          flooded={waterLevel > h.ground + 0.05}
          zone={h.zone}
        />
      ))}
    </group>
  );
}

// ─── Vegetation ───────────────────────────────────────────────────────────────

function Tree({
  x, z, height, radius, color, trunkColor = '#6b4423',
}: {
  x: number; z: number; height: number; radius: number; color: string; trunkColor?: string;
}) {
  const ground = valleyHeight(x);
  return (
    <group position={[x, ground, z]}>
      <mesh castShadow position={[0, height / 2 + 0.2, 0]}>
        <coneGeometry args={[radius, height, 6]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 0.4, 6]} />
        <meshLambertMaterial color={trunkColor} />
      </mesh>
    </group>
  );
}

const TREE_CLEARANCE = 2.0; // min distance from any house centre

function tooCloseToHouse(x: number, z: number): boolean {
  return HOUSES.some(h => {
    const dx = h.x - x;
    const dz = h.z - z;
    return Math.sqrt(dx * dx + dz * dz) < TREE_CLEARANCE;
  });
}

function Vegetation() {
  const trees = useMemo(() => {
    const items: Array<{
      x: number; z: number; height: number; radius: number; color: string; trunkColor?: string;
    }> = [];

    // Cottonwoods along channel edges (x ≈ ±2.5–4.5)
    for (let i = 0; i < 18; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * (2.6 + Math.random() * 1.8);
      const z = -9 + i * 1.1 + (Math.random() - 0.5) * 0.8;
      if (tooCloseToHouse(x, z)) continue;
      items.push({
        x, z,
        height: 1.8 + Math.random() * 0.9,
        radius: 0.55 + Math.random() * 0.25,
        color: '#5c9e3a',
        trunkColor: '#7a5c3a',
      });
    }

    // Willows right at channel banks (x ≈ ±1.5–2.6)
    for (let i = 0; i < 12; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * (1.5 + Math.random() * 1.0);
      const z = -8 + i * 1.4 + (Math.random() - 0.5);
      if (tooCloseToHouse(x, z)) continue;
      items.push({
        x, z,
        height: 1.2 + Math.random() * 0.6,
        radius: 0.7 + Math.random() * 0.3,
        color: '#77b852',
      });
    }

    // Upland trees (x ≈ ±10.5–14)
    for (let i = 0; i < 22; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * (10.5 + Math.random() * 3.5);
      const z = -9.5 + i * 0.9 + (Math.random() - 0.5);
      if (tooCloseToHouse(x, z)) continue;
      items.push({
        x, z,
        height: 1.4 + Math.random() * 0.8,
        radius: 0.5 + Math.random() * 0.2,
        color: '#3a7a2a',
      });
    }

    return items;
  }, []);

  return (
    <group>
      {trees.map((t, i) => (
        <Tree key={i} {...t} />
      ))}
    </group>
  );
}

// ─── Scene Camera Setup ───────────────────────────────────────────────────────

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 9, 20);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

// ─── Main Scene Export ────────────────────────────────────────────────────────

interface FloodplainSceneProps {
  waterLevel: number;
}

export default function FloodplainScene({ waterLevel }: FloodplainSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ fov: 50, near: 0.1, far: 200 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true }}
    >
      <CameraSetup />
      <color attach="background" args={['#a8d8ea']} />
      <fog attach="fog" args={['#c8e8f8', 25, 55]} />

      <Sky sunPosition={[100, 40, 10]} turbidity={4} rayleigh={0.5} />

      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#b8d8f0', '#6a9a50', 0.6]} />
      <directionalLight
        position={[12, 18, 10]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      <Terrain />
      <FloodZoneOverlays />
      <Water targetLevel={waterLevel} />
      <Structures waterLevel={waterLevel} />
      <Vegetation />

      <OrbitControls
        enablePan
        enableZoom
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={40}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
