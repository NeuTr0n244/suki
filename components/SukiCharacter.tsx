'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { useSpeaking } from '@/lib/speaking-context';

function Model() {
  const group = useRef<THREE.Group>(null);
  const { isSpeaking } = useSpeaking();

  // Load the new model - suki-model.glb
  const { scene, animations } = useGLTF('/suki-model.glb');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Play the first available animation
    if (actions) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) {
        firstAction.reset().fadeIn(0.5).play();
        // Start paused
        firstAction.paused = true;
      }
    }
  }, [actions]);

  // Control animation based on speaking state
  useEffect(() => {
    if (actions) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) {
        firstAction.paused = !isSpeaking;
      }
    }
  }, [isSpeaking, actions]);

  // Slow idle rotation
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={group}>
      <primitive
        object={scene}
        scale={2}
        position={[-1, -2.5, 0]}
        rotation={[0, -0.2, 0]}
      />
    </group>
  );
}

// Preload the model
try {
  useGLTF.preload('/suki-model.glb');
} catch(e) {
  console.log('Model preload failed, will try lazy loading');
}

export default function SukiCharacter() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 40 }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      {/* Lighting optimized for anime model */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-3, 3, 2]} intensity={0.5} color="#c084fc" />
      <pointLight position={[0, 2, 3]} intensity={0.5} color="#f472b6" />

      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </Canvas>
  );
}
