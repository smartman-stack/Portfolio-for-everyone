"use client";
import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Sphere,
  OrbitControls,
  Environment,
  Stars,
  Sparkles,
  Icosahedron,
  TorusKnot,
  Octahedron,
  Edges,
  Float,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";

interface Scene3DProps {
  enabled?: boolean;
  type?: "ANIMATED_SPHERE" | "FLOATING_PARTICLES" | "GEOMETRIC_SHAPES" | "WAVE_MOTION";
  color?: string;
  speed?: number;
}

function AnimatedSphere({ speed = 1.0 }: { speed?: number }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const [earthMap, normalMap, specularMap, cloudsMap] = useTexture(
    [
      "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
      "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg",
      "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg",
      "https://threejs.org/examples/textures/planets/earth_clouds_1024.png",
    ],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const effectiveSpeed = Number.isFinite(speed) ? speed : 1.0;
    if (earthRef.current) {
      earthRef.current.rotation.y = t * 0.15 * effectiveSpeed;
      earthRef.current.rotation.x = Math.sin(t * 0.05 * effectiveSpeed) * 0.15;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = t * 0.2 * effectiveSpeed;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <pointLight position={[0, 0, 3]} intensity={0.75} color="#ffd166" distance={6} decay={2} />
      <Sphere ref={earthRef} args={[1, 128, 128]} scale={2.55}>
        <meshPhongMaterial
          map={earthMap}
          normalMap={normalMap}
          specularMap={specularMap}
          shininess={18}
          emissive="#0a1628"
          emissiveIntensity={0.18}
        />
      </Sphere>
      <Sphere ref={cloudsRef} args={[1.01, 64, 64]} scale={2.65}>
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </Sphere>
    </group>
  );
}

function FloatingParticles({ color = "#22d3ee", speed = 1.0 }: { color?: string; speed?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const midLayerRef = useRef<THREE.Points>(null);
  const fineLayerRef = useRef<THREE.Points>(null);
  const [starTexture, setStarTexture] = useState<THREE.Texture | null>(null);
  const [sparkTexture, setSparkTexture] = useState<THREE.Texture | null>(null);
  const warmHex = useMemo(() => {
    const base = new THREE.Color(color || "#22d3ee");
    const warm = new THREE.Color("#ffd166");
    return `#${base.lerp(warm, 0.65).getHexString()}`;
  }, [color]);
  const accentHex = useMemo(() => {
    const accent = new THREE.Color(warmHex);
    accent.offsetHSL(-0.05, -0.08, 0.12);
    return `#${accent.getHexString()}`;
  }, [warmHex]);

  const createPositions = (count: number, spread: THREE.Vector3) => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * spread.x;
      positions[i3 + 1] = (Math.random() - 0.5) * spread.y;
      positions[i3 + 2] = (Math.random() - 0.5) * spread.z;
    }
    return positions;
  };

  const midPositions = useMemo(() => createPositions(1200, new THREE.Vector3(16, 10, 16)), []);
  const finePositions = useMemo(() => createPositions(2400, new THREE.Vector3(18, 12, 18)), []);
  const midBaseRef = useRef<Float32Array>(midPositions.slice());
  const fineBaseRef = useRef<Float32Array>(finePositions.slice());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.25, "rgba(255,255,255,0.9)");
    gradient.addColorStop(0.6, "rgba(255,255,255,0.3)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    setStarTexture(texture);
    return () => {
      texture.dispose();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.2, "rgba(255,255,255,0.7)");
    gradient.addColorStop(0.6, "rgba(255,200,200,0.2)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    setSparkTexture(texture);
    return () => {
      texture.dispose();
    };
  }, []);

  const pointerTarget = useRef(new THREE.Vector3());
  const pointerCurrent = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const effectiveSpeed = Number.isFinite(speed) ? speed : 1.0;
    pointerTarget.current.set(state.pointer.x * 4, state.pointer.y * 3, 0);
    pointerCurrent.current.lerp(pointerTarget.current, 0.05);

    if (groupRef.current) {
      groupRef.current.position.x = pointerCurrent.current.x;
      groupRef.current.position.y = pointerCurrent.current.y;
      groupRef.current.rotation.y += delta * 0.4 * effectiveSpeed;
      groupRef.current.rotation.x += delta * 0.25 * effectiveSpeed;
    }

    const updateLayer = (ref: { current: THREE.Points | null }, base: { current: Float32Array }, amp: number, freqMul = 1) => {
      if (!ref.current) return;
      const positionsAttr = ref.current.geometry.attributes.position;
      const arr = positionsAttr.array as Float32Array;
      const basePositions = base.current;
      const time = state.clock.elapsedTime * 0.8 * effectiveSpeed * freqMul;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i] = basePositions[i] + Math.sin(time + basePositions[i + 2] * 0.6) * amp;
        arr[i + 1] = basePositions[i + 1] + Math.cos(time * 1.3 + basePositions[i] * 0.5) * amp;
        arr[i + 2] = basePositions[i + 2] + Math.sin(time * 0.8 + basePositions[i] * 0.4) * amp * 0.6;
      }
      positionsAttr.needsUpdate = true;
      ref.current.geometry.computeBoundingSphere();
    };

    updateLayer(midLayerRef, midBaseRef, 0.14, 1.05);
    updateLayer(fineLayerRef, fineBaseRef, 0.09, 1.35);
  });

  return (
    <group ref={groupRef}>
      <points ref={midLayerRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={midPositions.length / 3}
            array={midPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.055}
          color={warmHex}
          map={starTexture ?? undefined}
          alphaTest={0.25}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      <points ref={fineLayerRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={finePositions.length / 3}
            array={finePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.032}
          color={accentHex}
          map={sparkTexture ?? starTexture ?? undefined}
          alphaTest={0.2}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      <Sparkles
        count={180}
        scale={[14, 10, 14]}
        speed={0.32 + speed * 0.22}
        opacity={0.42}
        color={warmHex}
        size={1.6}
      />
    </group>
  );
}

function GeometricShapes({ color = "#0ea5e9", speed = 1.0 }: { color?: string; speed?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const primaryHex = useMemo(() => {
    const base = new THREE.Color(color);
    const target = new THREE.Color("#8b5cf6");
    return `#${base.lerp(target, 0.35).getHexString()}`;
  }, [color]);
  const accentHex = useMemo(() => {
    const c = new THREE.Color(color);
    c.offsetHSL(0.12, 0.08, 0.18);
    return `#${c.getHexString()}`;
  }, [color]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.12 * speed;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.18 * speed;
    }
  });

  return (
    <Float speed={0.6 + speed * 0.4} rotationIntensity={0.7} floatIntensity={0.9}>
      <group ref={groupRef}>
        <Icosahedron args={[1.35, 1]}>
          <meshPhysicalMaterial
            color={primaryHex}
            transparent
            opacity={0.6}
            transmission={0.9}
            thickness={0.65}
            roughness={0.12}
            metalness={0.2}
            clearcoat={0.4}
          />
          <Edges scale={1.02} color="rgba(255,255,255,0.3)" />
        </Icosahedron>
        <TorusKnot position={[2.8, 0, -0.5]} args={[0.7, 0.18, 220, 24]}>
          <meshPhysicalMaterial
            color={accentHex}
            transparent
            opacity={0.55}
            transmission={0.7}
            thickness={0.45}
            roughness={0.18}
            metalness={0.35}
          />
        </TorusKnot>
        <Octahedron position={[-2.6, 0.3, 0.6]} args={[1, 0]}>
          <meshPhysicalMaterial
            color={`#${new THREE.Color(primaryHex).offsetHSL(-0.08, -0.02, 0.12).getHexString()}`}
            transparent
            opacity={0.45}
            transmission={0.82}
            thickness={0.5}
            roughness={0.18}
            metalness={0.22}
          />
          <Edges scale={1.05} color="rgba(255,255,255,0.25)" />
        </Octahedron>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}> 
          <ringGeometry args={[1.8, 2.5, 64]} />
          <meshBasicMaterial color={accentHex} transparent opacity={0.2} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </Float>
  );
}

function WaveMotion({ color = "#0ea5e9", speed = 1.0 }: { color?: string; speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const basePositions = useRef<Float32Array | null>(null);

  useEffect(() => {
    if (meshRef.current) {
      const attr = meshRef.current.geometry.attributes.position;
      if (attr && attr.array) {
        basePositions.current = (attr.array as Float32Array).slice();
        meshRef.current.rotation.x = -Math.PI / 2.4;
        meshRef.current.geometry.computeBoundingSphere();
      }
    }
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const attr = meshRef.current.geometry.attributes.position;
    if (!attr) return;

    if (!basePositions.current) {
      basePositions.current = (attr.array as Float32Array).slice();
    }

    const positions = attr.array as Float32Array;
    const base = basePositions.current;
    const effectiveSpeed = Number.isFinite(speed) ? speed : 1.0;
    const time = state.clock.elapsedTime * 0.8 * effectiveSpeed;

    for (let i = 0; i < positions.length; i += 3) {
      const x = base[i];
      const y = base[i + 1];
      positions[i + 2] = Math.sin(x * 0.8 + time) * 0.6 + Math.cos(y * 0.6 + time * 1.2) * 0.35;
    }

    attr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
    meshRef.current.geometry.computeBoundingSphere();
  });

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <planeGeometry args={[14, 14, 120, 120]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.35}
        transmission={0.9}
        roughness={0.25}
        thickness={0.4}
        clearcoat={0.3}
      />
    </mesh>
  );
}

function Scene3D({ enabled = true, type = "ANIMATED_SPHERE", color = "#0ea5e9", speed = 1.0 }: Scene3DProps) {
  if (!enabled) return null;

  const renderScene = () => {
    switch (type) {
      case "ANIMATED_SPHERE":
        return <AnimatedSphere speed={speed} />;
      case "FLOATING_PARTICLES":
        return <FloatingParticles color={color} speed={speed} />;
      case "GEOMETRIC_SHAPES":
        return <GeometricShapes color={color} speed={speed} />;
      case "WAVE_MOTION":
        return <WaveMotion color={color} speed={speed} />;
      default:
        return <AnimatedSphere color={color} speed={speed} />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true }}
        style={{ pointerEvents: "none" }}
      >
        <ambientLight intensity={0.4} color="#fef3c7" />
        <directionalLight position={[8, 10, 6]} intensity={0.9} color="#fff6d5" />
        <pointLight position={[-10, -10, -5]} intensity={0.45} color={color} />

        {renderScene()}

        <Stars radius={100} depth={45} count={3600} factor={4} saturation={0} fade speed={1} />

        <Environment preset="night" />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}

export default Scene3D;
