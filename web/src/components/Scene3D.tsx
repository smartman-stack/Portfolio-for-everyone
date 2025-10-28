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
      <Sphere ref={earthRef} args={[1, 128, 128]} scale={2.6}>
        <meshPhongMaterial
          map={earthMap}
          normalMap={normalMap}
          specularMap={specularMap}
          shininess={15}
        />
      </Sphere>
      <Sphere ref={cloudsRef} args={[1.02, 64, 64]} scale={2.7}>
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </Sphere>
    </group>
  );
}

function FloatingParticles({ color = "#22d3ee", speed = 1.0 }: { color?: string; speed?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const [starTexture, setStarTexture] = useState<THREE.Texture | null>(null);
  const basePositions = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 14;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 14;
    }
    return positions;
  }, []);
  const basePositionsRef = useRef<Float32Array>(basePositions.slice());

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

    if (points.current) {
      const positionsAttr = points.current.geometry.attributes.position;
      const arr = positionsAttr.array as Float32Array;
      const base = basePositionsRef.current;
      const time = state.clock.elapsedTime * 0.6 * effectiveSpeed;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i] = base[i] + Math.sin(time + base[i + 2]) * 0.2;
        arr[i + 1] = base[i + 1] + Math.cos(time * 1.2 + base[i]) * 0.2;
      }
      positionsAttr.needsUpdate = true;
      points.current.geometry.computeBoundingSphere();
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={points} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={basePositions.length / 3}
            array={basePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color={color}
          map={starTexture ?? undefined}
          alphaTest={0.3}
          transparent
          depthWrite={false}
          sizeAttenuation
        />
      </points>
      <Sparkles
        count={120}
        scale={[12, 8, 12]}
        speed={0.3 + speed * 0.2}
        opacity={0.5}
        color={color}
      />
    </group>
  );
}

function GeometricShapes({ color = "#0ea5e9", speed = 1.0 }: { color?: string; speed?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.1 * speed;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15 * speed;
    }
  });

  return (
    <group ref={groupRef}>
      <Icosahedron args={[1.3, 1]}>
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.55}
          transmission={0.85}
          thickness={0.6}
          roughness={0.15}
          metalness={0.2}
        />
      </Icosahedron>
      <TorusKnot position={[2.6, 0, -0.5]} args={[0.7, 0.2, 180, 16]}>
        <meshPhysicalMaterial
          color={new THREE.Color(color).offsetHSL(0.08, 0, 0.1)}
          transparent
          opacity={0.65}
          transmission={0.75}
          thickness={0.4}
          roughness={0.25}
          metalness={0.3}
        />
      </TorusKnot>
      <Octahedron position={[-2.4, 0.2, 0.6]} args={[1, 0]}>
        <meshPhysicalMaterial
          color={new THREE.Color(color).offsetHSL(-0.05, 0.05, 0.05)}
          transparent
          opacity={0.5}
          transmission={0.8}
          thickness={0.5}
          roughness={0.2}
          metalness={0.25}
        />
      </Octahedron>
    </group>
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
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color={color} />

        {renderScene()}

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <Environment preset="night" />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}

export default Scene3D;
