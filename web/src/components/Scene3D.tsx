"use client";
import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, OrbitControls, Environment, Stars, Box, Torus } from "@react-three/drei";
import * as THREE from "three";

interface Scene3DProps {
  enabled?: boolean;
  type?: "ANIMATED_SPHERE" | "FLOATING_PARTICLES" | "GEOMETRIC_SHAPES" | "WAVE_MOTION";
  color?: string;
  speed?: number;
}

function AnimatedSphere({ color = "#0ea5e9", speed = 1.0 }: { color?: string; speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15 * speed;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 * speed) * 0.5;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 100, 200]} scale={2.4}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.3}
        speed={1.5 * speed}
        roughness={0.1}
        metalness={0.8}
      />
    </Sphere>
  );
}

function FloatingParticles({ color = "#22d3ee", speed = 1.0 }: { color?: string; speed?: number }) {
  const points = useRef<THREE.Points>(null);

  const particlesPosition = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (points.current) {
      const effectiveSpeed = Number.isFinite(speed) ? speed : 1.0;
      points.current.rotation.x = state.clock.elapsedTime * 0.05 * effectiveSpeed;
      points.current.rotation.y = state.clock.elapsedTime * 0.075 * effectiveSpeed;
    }
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color={color} />
    </points>
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
      <Box position={[-2, 0, 0]} args={[1, 1, 1]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Sphere position={[0, 0, 0]} args={[0.8, 32, 32]}>
        <meshStandardMaterial color={color} />
      </Sphere>
      <Torus position={[2, 0, 0]} args={[0.6, 0.2, 16, 100]}>
        <meshStandardMaterial color={color} />
      </Torus>
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
    const time = state.clock.elapsedTime * effectiveSpeed;

    for (let i = 0; i < positions.length; i += 3) {
      const x = base[i];
      const y = base[i + 1];
      positions[i + 2] = Math.sin(x + time) * 0.5 + Math.cos(y * 0.5 + time * 0.8) * 0.25;
    }

    attr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
    meshRef.current.geometry.boundingSphere = null;
  });

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <planeGeometry args={[10, 10, 80, 80]} />
      <meshStandardMaterial color={color} wireframe />
    </mesh>
  );
}

function Scene3D({ enabled = true, type = "ANIMATED_SPHERE", color = "#0ea5e9", speed = 1.0 }: Scene3DProps) {
  if (!enabled) return null;

  const renderScene = () => {
    switch (type) {
      case "ANIMATED_SPHERE":
        return <AnimatedSphere color={color} speed={speed} />;
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
