import { useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import type { PlacedAsset, HouseState } from '../game/types';
import { ASSET_CATALOG } from '../game/types';

// ─── Terrain ──────────────────────────────────────────────────────────────────

function valleyHeight(x: number): number {
  const ax = Math.abs(x);
  if (ax <= 1.5)  return -2.0 + (ax / 1.5) * 0.3;
  if (ax <= 2.5)  return -1.7 + ((ax - 1.5) / 1.0) * 2.0;
  if (ax <= 6.0)  return  0.3 + ((ax - 2.5) / 3.5) * 0.4;
  if (ax <= 10.0) return  0.7 + ((ax - 6.0) / 4.0) * 1.0;
  return 1.7 + ((ax - 10.0) / 5.0) * 2.0;
}

function zoneColor(x: number): THREE.Color {
  const ax = Math.abs(x);
  if (ax <= 1.5)  return new THREE.Color('#8b7e66');
  if (ax <= 2.5)  return new THREE.Color('#5a7d4a');
  if (ax <= 6.0)  return new THREE.Color('#6b8e5a');
  if (ax <= 10.0) return new THREE.Color('#7d9e6a');
  return new THREE.Color('#4a7a3a');
}

function Terrain({ onClick }: { onClick?: (x: number, z: number) => void }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(32, 22, 200, 100);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const noise = (x: number, z: number) =>
      Math.sin(x * 1.3) * 0.06 + Math.cos(z * 0.9) * 0.07 + Math.sin(x * 2.8 + z) * 0.03;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, valleyHeight(x) + noise(x, z));
      const c = zoneColor(x);
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

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (!onClick) return;
    e.stopPropagation();
    const p = e.point;
    onClick(p.x, p.z);
  }, [onClick]);

  return (
    <mesh geometry={geo} receiveShadow onClick={handleClick}>
      <meshLambertMaterial vertexColors side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Water ────────────────────────────────────────────────────────────────────

function Water({ targetLevel }: { targetLevel: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const currentLevel = useRef(targetLevel);
  const time = useRef(0);

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(32, 22, 60, 40);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    time.current += delta;
    currentLevel.current = THREE.MathUtils.lerp(currentLevel.current, targetLevel, delta * 2.5);
    meshRef.current.position.y = currentLevel.current;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i,
        Math.sin(x * 0.8 + time.current * 1.2) * 0.025 +
        Math.cos(z * 0.9 + time.current * 0.9) * 0.020 +
        Math.sin((x + z) * 0.5 + time.current * 0.6) * 0.012
      );
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.38, 0]}>
        <planeGeometry args={[7.0, 22]} />
        <meshBasicMaterial color="#2255cc" transparent opacity={0.13} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8.0, 1.0, 0]}>
        <planeGeometry args={[4.0, 22]} />
        <meshBasicMaterial color="#cc7722" transparent opacity={0.11} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.0, 1.0, 0]}>
        <planeGeometry args={[4.0, 22]} />
        <meshBasicMaterial color="#cc7722" transparent opacity={0.11} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Houses ───────────────────────────────────────────────────────────────────

const ZONE_COLORS: Record<string, string> = {
  '100yr': '#d4a020',
  '500yr': '#c06020',
  safe: '#dddddd',
};

function House({ house }: { house: HouseState }) {
  if (house.removed) return null;

  const wallColor = house.flooded ? '#cc2222' : house.protected ? '#4488ff' : ZONE_COLORS[house.zone];
  const roofColor = house.flooded ? '#991111' : house.protected ? '#2255aa' : '#8b4513';

  return (
    <group position={[house.x, house.ground, house.z]}>
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshLambertMaterial color={wallColor} />
      </mesh>
      <mesh castShadow position={[0, 1.225, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.72, 0.65, 4]} />
        <meshLambertMaterial color={roofColor} />
      </mesh>
      <mesh castShadow position={[0.2, 1.38, -0.1]}>
        <boxGeometry args={[0.14, 0.28, 0.14]} />
        <meshLambertMaterial color="#888" />
      </mesh>
      {/* Protection shield indicator */}
      {house.protected && (
        <mesh position={[0, 1.0, 0]}>
          <sphereGeometry args={[1.0, 16, 12]} />
          <meshBasicMaterial color="#4488ff" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function Houses({ houses }: { houses: HouseState[] }) {
  return (
    <group>
      {houses.map((h, i) => (
        <House key={i} house={h} />
      ))}
    </group>
  );
}

// ─── Placed Assets (3D representations) ──────────────────────────────────────

function PlacedAsset3D({ placed }: { placed: PlacedAsset }) {
  const catalog = ASSET_CATALOG.find(a => a.id === placed.assetId);
  if (!catalog) return null;

  const gY = valleyHeight(placed.x);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
  });

  switch (placed.assetId) {
    case 'detention-pond':
      return (
        <group position={[placed.x, gY - 0.15, placed.z]}>
          {/* Basin */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.2, 24]} />
            <meshLambertMaterial color="#6b9fc4" />
          </mesh>
          {/* Rim */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[1.0, 1.3, 24]} />
            <meshLambertMaterial color="#8b7e66" />
          </mesh>
        </group>
      );

    case 'floodwall':
      return (
        <group position={[placed.x, gY, placed.z]}>
          <mesh castShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[2.5, 0.8, 0.3]} />
            <meshLambertMaterial color="#999999" />
          </mesh>
          {/* Top cap */}
          <mesh position={[0, 0.82, 0]}>
            <boxGeometry args={[2.6, 0.06, 0.4]} />
            <meshLambertMaterial color="#bbbbbb" />
          </mesh>
          {/* Protection radius indicator */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[2.8, 3.0, 32]} />
            <meshBasicMaterial color="#4488ff" transparent opacity={0.2} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      );

    case 'channel-widening':
      return (
        <group position={[placed.x, gY, placed.z]}>
          {/* Construction marker */}
          <mesh castShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 1.0, 8]} />
            <meshLambertMaterial color="#ff8800" />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <coneGeometry args={[0.25, 0.3, 4]} />
            <meshLambertMaterial color="#ffaa00" />
          </mesh>
          {/* Excavation area */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <circleGeometry args={[1.5, 6]} />
            <meshLambertMaterial color="#7a6b55" />
          </mesh>
        </group>
      );

    case 'bioswale':
      return (
        <group position={[placed.x, gY, placed.z]}>
          {/* Green strip */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[2.0, 1.0]} />
            <meshLambertMaterial color="#5ca83a" side={THREE.DoubleSide} />
          </mesh>
          {/* Small plants */}
          {[-0.5, 0, 0.5].map((ox, i) => (
            <mesh key={i} castShadow position={[ox, 0.2, 0]}>
              <coneGeometry args={[0.15, 0.35, 5]} />
              <meshLambertMaterial color="#3a8a2a" />
            </mesh>
          ))}
        </group>
      );

    case 'buyout':
      return (
        <group position={[placed.x, gY, placed.z]}>
          {/* Cleared lot marker */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[1.2, 1.2]} />
            <meshLambertMaterial color="#8a9a6a" side={THREE.DoubleSide} />
          </mesh>
        </group>
      );

    default:
      return null;
  }
}

function PlacedAssets({ assets }: { assets: PlacedAsset[] }) {
  return (
    <group>
      {assets.map(a => (
        <PlacedAsset3D key={a.id} placed={a} />
      ))}
    </group>
  );
}

// ─── Vegetation ───────────────────────────────────────────────────────────────

function Tree({ x, z, height, radius, color, trunkColor = '#6b4423' }: {
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

function Vegetation() {
  const trees = useMemo(() => {
    const items: Array<{
      x: number; z: number; height: number; radius: number; color: string; trunkColor?: string;
    }> = [];
    for (let i = 0; i < 18; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      items.push({
        x: side * (2.6 + Math.random() * 1.8),
        z: -9 + i * 1.1 + (Math.random() - 0.5) * 0.8,
        height: 1.8 + Math.random() * 0.9,
        radius: 0.55 + Math.random() * 0.25,
        color: '#5c9e3a',
        trunkColor: '#7a5c3a',
      });
    }
    for (let i = 0; i < 12; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      items.push({
        x: side * (1.5 + Math.random() * 1.0),
        z: -8 + i * 1.4 + (Math.random() - 0.5),
        height: 1.2 + Math.random() * 0.6,
        radius: 0.7 + Math.random() * 0.3,
        color: '#77b852',
      });
    }
    for (let i = 0; i < 22; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      items.push({
        x: side * (10.5 + Math.random() * 3.5),
        z: -9.5 + i * 0.9 + (Math.random() - 0.5),
        height: 1.4 + Math.random() * 0.8,
        radius: 0.5 + Math.random() * 0.2,
        color: '#3a7a2a',
      });
    }
    return items;
  }, []);

  return (
    <group>
      {trees.map((t, i) => <Tree key={i} {...t} />)}
    </group>
  );
}

// ─── Placement Preview ───────────────────────────────────────────────────────

function PlacementPreview({ selectedAssetId }: { selectedAssetId: string | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, raycaster, pointer } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

  useFrame(() => {
    if (!meshRef.current || !selectedAssetId) {
      if (meshRef.current) meshRef.current.visible = false;
      return;
    }
    raycaster.setFromCamera(pointer, camera);
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, target);
    if (target) {
      meshRef.current.visible = true;
      meshRef.current.position.set(target.x, valleyHeight(target.x) + 0.1, target.z);
    }
  });

  const catalog = ASSET_CATALOG.find(a => a.id === selectedAssetId);
  const radius = catalog?.effect.type === 'localProtection' ? catalog.effect.radius : 1.5;

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[radius - 0.15, radius, 32]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.4} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Camera Setup ─────────────────────────────────────────────────────────────

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 9, 20);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

interface GameSceneProps {
  waterLevel: number;
  houses: HouseState[];
  placedAssets: PlacedAsset[];
  selectedAssetId: string | null;
  onTerrainClick?: (x: number, z: number) => void;
}

export default function GameScene({
  waterLevel,
  houses,
  placedAssets,
  selectedAssetId,
  onTerrainClick,
}: GameSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ fov: 50, near: 0.1, far: 200 }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
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

      <Terrain onClick={onTerrainClick} />
      <FloodZoneOverlays />
      <Water targetLevel={waterLevel} />
      <Houses houses={houses} />
      <PlacedAssets assets={placedAssets} />
      <Vegetation />
      {selectedAssetId && <PlacementPreview selectedAssetId={selectedAssetId} />}

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
