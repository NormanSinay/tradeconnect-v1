import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ParticlesProps {
  count?: number;
}

const Particles: React.FC<ParticlesProps> = ({ count = 5000 }) => {
  const ref = useRef<THREE.Points>(null);

  // Generate random particle positions
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Distribute particles in a sphere
      const radius = 5 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }

    return positions;
  }, [count]);

  // Animate particles
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta * 0.05;
      ref.current.rotation.y -= delta * 0.075;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#E63946"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
};

interface MouseInteractionProps {
  mouseX: number;
  mouseY: number;
}

const MouseInteraction: React.FC<MouseInteractionProps> = ({ mouseX, mouseY }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, mouseX * 2, 0.1);
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, -mouseY * 2, 0.1);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color="#6B1E22"
        emissive="#E63946"
        emissiveIntensity={0.5}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
};

interface HeroCanvasProps {
  className?: string;
}

const HeroCanvas: React.FC<HeroCanvasProps> = ({ className }) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = event;
    const { width, height } = currentTarget.getBoundingClientRect();

    setMousePosition({
      x: (clientX / width) * 2 - 1,
      y: -(clientY / height) * 2 + 1,
    });
  };

  return (
    <div
      className={className}
      onMouseMove={handleMouseMove}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Particles count={5000} />
        <MouseInteraction mouseX={mousePosition.x} mouseY={mousePosition.y} />
      </Canvas>
    </div>
  );
};

export default HeroCanvas;
