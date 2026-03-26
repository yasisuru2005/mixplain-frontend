// 'use client';

// import React, { useRef, useState, useEffect } from 'react';
// import { useFrame, useThree } from '@react-three/fiber';
// import { Html, Float, Line } from '@react-three/drei';
// import * as THREE from 'three';
// import { Activity } from 'lucide-react';
// import { motion } from 'framer-motion';
// import Background3D from './Background3D';

// // --- 1. THE CINEMATIC CAMERA RIG ---
// function CinematicCamera() {
//   const { camera, mouse } = useThree();
//   const [zoomedIn, setZoomedIn] = useState(false);

//   useEffect(() => {
//     // Start far away (inside the uploading orb), then pull back to reveal the UI
//     camera.position.set(0, 0, 25);
//     setTimeout(() => setZoomedIn(true), 100); 
//   }, [camera]);

//   useFrame((_state, delta) => {
//     // 1. Zoom Transition: Pull back from the core
//     const targetZ = zoomedIn ? 11 : 25;
//     camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3, delta);

//     // 2. Mouse Parallax (Only active after zoom finishes)
//     if (zoomedIn && Math.abs(camera.position.z - 14) < 1) {
//       camera.position.x = THREE.MathUtils.damp(camera.position.x, mouse.x * 2, 2, delta);
//       camera.position.y = THREE.MathUtils.damp(camera.position.y, mouse.y * 2 + 1, 2, delta);
//       camera.lookAt(0, 0, 0);
//     }
//   });
//   return null;
// }

// // --- 2. ORB CORE (GENRE IDENTITY) ---
// function SpatialCore({ genre, confidence }: { genre: string, confidence: number }) {
//   const coreRef = useRef<THREE.Mesh>(null);
//   const shellRef = useRef<THREE.Points>(null);
  
//   // Track the animation phase
//   const [phase, setPhase] = useState<'spinning' | 'shrinking' | 'bursting' | 'settled'>('spinning');

//   useEffect(() => {
//     const t1 = setTimeout(() => setPhase('shrinking'), 400); // Quick shrink (Anticipation)
//     const t2 = setTimeout(() => setPhase('bursting'), 800);  // The Explosion
//     const t3 = setTimeout(() => setPhase('settled'), 1600);  // Return to normal
//     return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); }
//   }, []);

//   useFrame((state, delta) => {
//     if (!coreRef.current || !shellRef.current) return;

//     let targetScale = 1;
//     let rotSpeed = 0.5;

//     // Choreograph the physics
//     if (phase === 'spinning') {
//       targetScale = 0.2; // Start tiny like the loading orb
//       rotSpeed = 15.0;   // Spin incredibly fast
//     } else if (phase === 'shrinking') {
//       targetScale = 0.05; // Suck inward before the pop
//       rotSpeed = 20.0;
//     } else if (phase === 'bursting') {
//       targetScale = 2.2;  // Overshoot the expansion
//       rotSpeed = 4.0;     // Start slowing down
//     } else {
//       // Settled (Breathing effect based on confidence)
//       const pulseSpeed = confidence > 80 ? 6 : 3;
//       targetScale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.08;
//       rotSpeed = 0.5;
//     }

//     // Apply smooth damping
//     coreRef.current.scale.setScalar(THREE.MathUtils.damp(coreRef.current.scale.x, targetScale, 6, delta));
//     shellRef.current.scale.setScalar(THREE.MathUtils.damp(shellRef.current.scale.x, targetScale, 6, delta));

//     coreRef.current.rotation.y += delta * rotSpeed;
//     shellRef.current.rotation.y -= delta * (rotSpeed * 0.5); // Counter-rotate shell
//   });

//   return (
//     <group>
//       <mesh ref={coreRef}>
//         <icosahedronGeometry args={[1.8, 2]} />
//         <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.15} />
//       </mesh>
//       <points ref={shellRef}>
//         <sphereGeometry args={[2.2, 32, 32]} />
//         <pointsMaterial color="#22d3ee" size={0.02} transparent opacity={0.4} />
//       </points>

//       {/* Only show text once settled */}
//       {phase === 'settled' && (
//         <Html center className="pointer-events-none">
//           <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center">
//             <Activity size={24} className="text-cyan-400 mb-2 opacity-80" />
//             <h2 className="text-5xl font-medium text-white tracking-tighter drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]">
//               {genre}
//             </h2>
//             <p className="text-[10px] text-cyan-400 font-mono tracking-widest mt-2 bg-cyan-900/40 px-3 py-1 rounded-full border border-cyan-500/50 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
//               {confidence}% SYNC
//             </p>
//           </motion.div>
//         </Html>
//       )}
//     </group>
//   );
// }

// // --- 3. RADIAL SPECTRAL BALANCE (DUAL EQ RINGS) ---
// function RadialEQ({ userSpectrum, targetSpectrum }: any) {
//   const bands = 7;
//   const radius = 4.5;
//   const groupRef = useRef<THREE.Group>(null);
  
//   // Wait for the orb to burst before expanding
//   const [expand, setExpand] = useState(false);
//   useEffect(() => { setTimeout(() => setExpand(true), 800); }, []); // Matches the 'bursting' timer

//   const mapTo7Bands = (data: any) => {
//     if (!data) return Array(7).fill(0.5);
//     return [ data.low, data.low * 0.8 + data.mid_low * 0.2, data.mid_low, data.mid_low * 0.5 + data.mid_high * 0.5, data.mid_high, data.high * 0.7 + data.mid_high * 0.3, data.high ];
//   };

//   const userHeights = mapTo7Bands(userSpectrum);
//   const targetHeights = mapTo7Bands(targetSpectrum);

//   useFrame((_, delta) => {
//     if (!groupRef.current) return;
//     groupRef.current.rotation.z += delta * 0.05;
//     // Scale from 0 to 1 when 'expand' triggers
//     const targetScale = expand ? 1 : 0.001;
//     groupRef.current.scale.setScalar(THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 5, delta));
//   });

//   return (
//     <group ref={groupRef} rotation={[-Math.PI / 2.5, 0, 0]} scale={0.001}>
//       {Array.from({ length: bands }).map((_, i) => {
//         const angle = (i / bands) * Math.PI * 2;
//         const x = Math.cos(angle) * radius;
//         const y = Math.sin(angle) * radius;
//         const userHeight = Math.max(0.1, userHeights[i] * 5); 
//         const targetHeight = Math.max(0.1, targetHeights[i] * 5);

//         return (
//           <group key={i} position={[x, y, 0]} rotation={[0, 0, angle]}>
//             <mesh position={[0.1, targetHeight / 2, -0.1]}>
//               <boxGeometry args={[0.08, targetHeight, 0.08]} />
//               <meshBasicMaterial color="#4b5563" transparent opacity={0.3} />
//             </mesh>
//             <mesh position={[-0.1, userHeight / 2, 0.1]}>
//               <boxGeometry args={[0.08, userHeight, 0.08]} />
//               <meshBasicMaterial color="#22d3ee" transparent opacity={0.8} />
//             </mesh>
//           </group>
//         );
//       })}
//     </group>
//   );
// }

// function OrbitingMetrics({ metrics }: any) {
//   const groupRef = useRef<THREE.Group>(null);
  
//   // Wait slightly longer than the EQ rings to stagger the explosion
//   const [expand, setExpand] = useState(false);
//   useEffect(() => { setTimeout(() => setExpand(true), 950); }, []);

//   useFrame((_, delta) => {
//     if (!groupRef.current) return;
//     groupRef.current.rotation.y += delta * 0.08;
//     const targetScale = expand ? 1 : 0.001;
//     groupRef.current.scale.setScalar(THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 4, delta));
//   });

//   return (
//     <group ref={groupRef} scale={0.001}>
//       {/* (Keep your existing LUFS and Dynamics meshes here) */}
//       <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2, 0]}>
//         <ringGeometry args={[6, 6.05, 64, 1, 0, Math.PI * 1.2]} />
//         <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} transparent opacity={0.4} />
//         <Html position={[6, 0, 0]} center>
//           <div className="flex flex-col items-center">
//             <span className="text-[8px] text-cyan-500 font-mono tracking-widest uppercase">Loudness</span>
//             <span className="text-sm text-white font-mono">{metrics.lufs} LUFS</span>
//           </div>
//         </Html>
//       </mesh>
//       <mesh rotation={[Math.PI / 2.2, 0, Math.PI]} position={[0, -2, 0]}>
//         <ringGeometry args={[7, 7.05, 64, 1, 0, Math.PI * 0.8]} />
//         <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} transparent opacity={0.4} />
//         <Html position={[7, 0, 0]} center>
//           <div className="flex flex-col items-center">
//             <span className="text-[8px] text-amber-500 font-mono tracking-widest uppercase">Dynamics</span>
//             <span className="text-sm text-white font-mono">{metrics.dynamic_range} dB</span>
//           </div>
//         </Html>
//       </mesh>
//     </group>
//   );
// }

// // --- 5. FLOATING DIAGNOSTIC NODES ---
// function DiagnosticNode({ position, color, issue, onSelect, delay }: any) {
//   const [hovered, setHovered] = useState(false);
//   const meshRef = useRef<THREE.Mesh>(null);
//   const [visible, setVisible] = useState(false);

//   useEffect(() => {
//     setTimeout(() => setVisible(true), delay);
//   }, [delay]);

//   // Replaced 'state' with '_' to clear the linter warning
//   useFrame((_, delta) => {
//     if (!meshRef.current) return;
//     const targetScale = hovered ? 1.8 : (visible ? 1 : 0);
//     meshRef.current.scale.setScalar(THREE.MathUtils.damp(meshRef.current.scale.x, targetScale, 6, delta));
//   });

//   return (
//     <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
//       <group position={position}>
//         {visible && <Line points={[[0, 0, 0], [-position[0] * 0.8, -position[1] * 0.8, -position[2] * 0.8]]} color={color} opacity={0.2} transparent lineWidth={1} />}
        
//         <mesh 
//           ref={meshRef}
//           scale={0}
//           onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
//           onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
//           onClick={() => onSelect(issue)}
//         >
//           <sphereGeometry args={[0.25, 32, 32]} />
//           <meshBasicMaterial color={color} />
//           {/* Inner Core */}
//           <mesh>
//             <sphereGeometry args={[0.4, 32, 32]} />
//             <meshBasicMaterial color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
//           </mesh>
//         </mesh>

//         {hovered && visible && (
//           <Html position={[0.5, 0.5, 0]} center zIndexRange={[100, 0]}>
//             <div className="text-[10px] font-mono tracking-widest text-white bg-[#030712]/80 px-4 py-2 rounded-lg border border-white/20 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] pointer-events-none whitespace-nowrap">
//               <span style={{ color }}>●</span> {issue.cat} ANOMALY
//             </div>
//           </Html>
//         )}
//       </group>
//     </Float>
//   );
// }

// // --- MAIN CANVAS EXPORT ---
// export default function ResultsHUD({ result, onIssueSelect }: any) {
//   return (
//     <div className="absolute inset-0 z-0">
//       <Background3D mode="results">
//         <fog attach="fog" args={['#030712', 10, 30]} />
//         <CinematicCamera />
        
//         <SpatialCore genre={result.meta.genre} confidence={result.meta.confidence} />
//         <RadialEQ userSpectrum={result.visualization.user_spectrum} targetSpectrum={result.visualization.ideal_spectrum} />
//         <OrbitingMetrics metrics={result.metrics} />
        
//         {/* Spawn nodes with staggered delays so they "pop" out of the orb sequentially */}
//         {result.issues.mix_balance[0] && (
//            <DiagnosticNode position={[-5, 3, 2]} color="#ef4444" delay={1500} issue={{...result.issues.mix_balance[0], cat: 'EQ'}} onSelect={onIssueSelect} />
//         )}
//         {result.issues.loudness[0] && (
//            <DiagnosticNode position={[6, -2, 1]} color="#eab308" delay={1800} issue={{...result.issues.loudness[0], cat: 'LVL'}} onSelect={onIssueSelect} />
//         )}
//         {result.issues.dynamics[0] && (
//            <DiagnosticNode position={[3, 5, -3]} color="#06b6d4" delay={2100} issue={{...result.issues.dynamics[0], cat: 'DYN'}} onSelect={onIssueSelect} />
//         )}
//       </Background3D>
//       {/* Immersive Vignette */}
//       <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(2,6,17,0.0)_40%,rgba(2,6,17,0.95)_100%)]" />
//     </div>
//   );
// }