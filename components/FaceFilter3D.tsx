import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber/native';
import * as THREE from 'three';
import { Face } from 'react-native-vision-camera-face-detector';
import { View, StyleSheet } from 'react-native';

interface FaceFilter3DProps {
  face: Face | null;
  cameraFormat: { width: number; height: number };
  screenDimensions: { width: number; height: number };
  maskType: 'glasses' | 'mustache';
  enabled?: boolean;
  onStatus?: (status: string) => void;
}

// Simple 3D glasses using basic geometry (fallback/test)
function SimpleGlasses({
  position,
  rotation,
  scale
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Left lens */}
      <mesh position={[-0.35, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.7} />
      </mesh>
      {/* Right lens */}
      <mesh position={[0.35, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.7} />
      </mesh>
      {/* Bridge */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.03, 0.03]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.6, 0, 0.15]} rotation={[0, Math.PI / 6, 0]}>
        <boxGeometry args={[0.4, 0.03, 0.03]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.6, 0, 0.15]} rotation={[0, -Math.PI / 6, 0]}>
        <boxGeometry args={[0.4, 0.03, 0.03]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  );
}

// Scene content with face tracking
function SceneContent({
  face,
  cameraFormat,
  maskType,
  onStatus
}: FaceFilter3DProps) {
  if (!face) {
    onStatus?.('no_face');
    return null;
  }

  onStatus?.('rendering');

  // Coordinate Mapping: Vision Camera -> Three.js World
  const cxSensor = face.bounds.x + face.bounds.width / 2;
  const cySensor = face.bounds.y + face.bounds.height / 2;

  // Normalize to 0..1
  let normX = cxSensor / cameraFormat.width;
  let normY = cySensor / cameraFormat.height;

  // Mirror X for front camera
  normX = 1 - normX;

  // Map to Three.js viewport coordinates
  const VIEWPORT_WIDTH = 6;
  const VIEWPORT_HEIGHT = 10;

  const x3d = (normX - 0.5) * VIEWPORT_WIDTH;
  const y3d = -(normY - 0.5) * VIEWPORT_HEIGHT;
  const z3d = 0;

  // Rotation (degrees to radians)
  const rollRad = THREE.MathUtils.degToRad(-(face.rollAngle ?? 0));
  const yawRad = THREE.MathUtils.degToRad(-(face.yawAngle ?? 0));

  // Scale based on face width
  const faceWidthRatio = face.bounds.width / cameraFormat.width;
  const baseScale = maskType === 'glasses' ? 2.5 : 1.5;
  const scaleVal = faceWidthRatio * baseScale;

  // Y offset for mustache positioning
  const yOffset = maskType === 'mustache' ? -0.8 * scaleVal : 0;

  return (
    <SimpleGlasses
      position={[x3d, y3d + yOffset, z3d]}
      rotation={[0, yawRad, rollRad]}
      scale={scaleVal}
    />
  );
}

export default function FaceFilter3D(props: FaceFilter3DProps) {
  const { enabled = true, onStatus } = props;

  if (!enabled) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Canvas
        style={{ flex: 1, backgroundColor: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          onStatus?.('canvas_ready');
        }}
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[0, 5, 5]} intensity={0.8} />
        <SceneContent {...props} />
      </Canvas>
    </View>
  );
}
