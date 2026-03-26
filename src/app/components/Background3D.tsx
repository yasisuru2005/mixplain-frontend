'use client';

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef, useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import { Activity } from "lucide-react";

function CameraRig() {
  const { camera, mouse } = useThree();
  useFrame((_, delta) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, mouse.x * 0.5, 2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, mouse.y * 0.5, 2, delta);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function VortexBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float uTime; varying vec2 vUv;
        float hash(vec2 p) { p = fract(p * vec2(123.34, 345.45)); p += dot(p, p + 34.345); return fract(p.x * p.y); }
        float noise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); float a = hash(i); float b = hash(i + vec2(1.0, 0.0)); float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0)); vec2 u = f * f * (3.0 - 2.0 * f); return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y; }
        float fbm(vec2 p) { float value = 0.0; float amp = 0.5; for (int i = 0; i < 6; i++) { value += amp * noise(p); p *= 2.0; amp *= 0.5; } return value; }
        void main() {
          vec2 uv = vUv - 0.5; uv.x *= 1.55; uv.y *= 0.92;
          float t = uTime * 0.05; float r = length(uv); float a = atan(uv.y, uv.x);
          float swirl = sin(a * 2.4 - r * 12.0 - t * 6.0) * 0.045; float swirl2 = cos(a * 4.0 + r * 18.0 - t * 4.5) * 0.025; float rr = r + swirl + swirl2;
          vec2 smokeUv = uv * 2.4; smokeUv += vec2(sin(a * 1.8 + t * 5.0) * 0.18, cos(a * 2.6 - t * 4.0) * 0.15);
          float smoke = fbm(smokeUv); smoke = smoothstep(0.25, 0.95, smoke);
          float cloud1 = fbm(smokeUv * 0.85 + vec2(t * 1.4, -t * 0.8)); float cloud2 = fbm(smokeUv * 1.3 - vec2(t * 0.9, t * 1.1)); float cloudMix = mix(cloud1, cloud2, 0.5); cloudMix = smoothstep(0.28, 0.9, cloudMix);
          float ring1 = smoothstep(0.20, 0.0, abs(rr - 0.24)); float ring2 = smoothstep(0.24, 0.0, abs(rr - 0.46)); float ring3 = smoothstep(0.28, 0.0, abs(rr - 0.74)); float ring4 = smoothstep(0.34, 0.0, abs(rr - 1.08)); float ring5 = smoothstep(0.40, 0.0, abs(rr - 1.46));
          float rings = ring1 * 1.0 + ring2 * 0.92 + ring3 * 0.78 + ring4 * 0.58 + ring5 * 0.36; rings *= (0.35 + smoke * 1.15);
          float centerVoid = 1.0 - smoothstep(0.0, 0.20, r); float centerGlow = smoothstep(0.34, 0.04, r) * 0.18; float outerFade = 1.0 - smoothstep(0.95, 1.75, r);
          float cloudyBands = rings * (0.72 + cloudMix * 1.2);
          vec3 deepBlue = vec3(0.02, 0.05, 0.10); vec3 fogBlue = vec3(0.18, 0.36, 0.62); vec3 glowBlue = vec3(0.52, 0.70, 0.95); vec3 mistBlue = vec3(0.42, 0.62, 0.88);
          vec3 color = vec3(0.0); color += deepBlue * smoke * 0.42; color += fogBlue * rings * 0.95; color += mistBlue * cloudyBands * 0.62; color += glowBlue * rings * 0.22; color += mistBlue * cloudMix * 0.16 * outerFade; color += glowBlue * centerGlow * 0.12;
          float alpha = rings * 0.62 + smoke * 0.10 + centerGlow * 0.06; alpha += cloudyBands * 0.28; alpha *= outerFade; alpha *= 1.0 - centerVoid * 0.78;
          gl_FragColor = vec4(color, alpha * 0.95);
        }
      `
    });
  }, []);
  useFrame((state) => { if (meshRef.current) (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime(); });
  return <mesh ref={meshRef} position={[0, 0, -5.5]} material={material}><planeGeometry args={[36, 24]} /></mesh>;
}

function RippleBackground({ isLoading, mode }: { isLoading: boolean, mode: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const timeRef = useRef(0);
  const speedRef = useRef(1.0);
  const [phase, setPhase] = useState('normal');

  useEffect(() => {
    if (mode === 'results') {
      setPhase('hidden'); // 0 to 400ms: Hide ripples while orb shrinks
      const t1 = setTimeout(() => setPhase('shockwave'), 400); // 400ms: SHOCKWAVE!
      const t2 = setTimeout(() => setPhase('normal'), 1200);   // 1200ms: Settle down
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setPhase(isLoading ? 'loading' : 'normal'); // Loading = Reverse ripples
    }
  }, [isLoading, mode]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, 
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 1.0 } },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float uTime; 
        uniform float uOpacity; 
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv - 0.5; uv.x *= 1.5; float d = length(uv); float t = uTime * 1.0;
          float freq = 40.0; float wave = sin(d * freq - t); 
          float rings = smoothstep(0.85, 0.98, wave); float glow = smoothstep(0.5, 0.98, wave) * 0.4;
          float centerFade = smoothstep(0.05, 0.2, d); float outerFade = smoothstep(0.8, 0.3, d); float mask = centerFade * outerFade;
          vec3 ringColor = vec3(0.15, 0.35, 0.6); vec3 glowColor = vec3(0.05, 0.15, 0.5); vec3 baseBgColor = vec3(0.02, 0.08, 0.18);
          vec3 finalColor = baseBgColor; finalColor += (ringColor * rings + glowColor * glow) * mask;
          float centerGlow = smoothstep(0.2, 0.0, d) * 0.1; finalColor += ringColor * centerGlow;
          float baseAlpha = 0.5 * outerFade; float alpha = baseAlpha + (rings + glow) * mask + centerGlow;
          alpha = clamp(alpha, 0.0, 1.0); 
          gl_FragColor = vec4(finalColor, alpha * uOpacity); 
        }
      `,
    });
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    
    let targetSpeed = 1.0;
    let targetOpac = 1.0;

    if (phase === 'loading') { targetSpeed = -6.0; targetOpac = 1.0; }      // Sucking inward
    else if (phase === 'hidden') { targetSpeed = 0.0; targetOpac = 0.0; }   // Invisible tension
    else if (phase === 'shockwave') { targetSpeed = 12.0; targetOpac = 1.0; } // EXPLOSION OUTWARD
    else { targetSpeed = mode === 'results' ? 0.25 : 1.0; targetOpac = 1.0; }                           // Normal idle

    // Smooth physical acceleration/deceleration
    speedRef.current = THREE.MathUtils.damp(speedRef.current, targetSpeed, 4, delta);
    timeRef.current += delta * speedRef.current;
    mat.uniforms.uTime.value = timeRef.current;

    // Snap visibility
    mat.uniforms.uOpacity.value = THREE.MathUtils.damp(mat.uniforms.uOpacity.value, targetOpac, 12, delta);
  });

  return <mesh ref={meshRef} position={[0, 0, -5.5]} material={material}><planeGeometry args={[36, 24]} /></mesh>;
}

function ParticleClusters({ isLoading }: { isLoading: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const count = 3000;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const clusterType = Math.random();
      let x = 0, y = 0, z = 0;
      if (clusterType < 0.45) {
        const radius = Math.pow(Math.random(), 0.8) * 7.0; const angle = Math.random() * Math.PI * 2;
        x = Math.cos(angle) * radius + (Math.random() - 0.5) * 1.2; y = Math.sin(angle) * radius * 0.9 + (Math.random() - 0.5) * 1.2; z = (Math.random() - 0.5) * 1.8;
      } else if (clusterType < 0.72) {
        x = -6.8 + (Math.random() - 0.5) * 2.4; y = (Math.random() - 0.5) * 9.0; z = (Math.random() - 0.5) * 1.4;
      } else {
        x = 6.8 + (Math.random() - 0.5) * 2.4; y = (Math.random() - 0.5) * 9.0; z = (Math.random() - 0.5) * 1.4;
      }
      arr[i * 3] = x; arr[i * 3 + 1] = y; arr[i * 3 + 2] = z;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !matRef.current) return;
    const t = state.clock.getElapsedTime();
    pointsRef.current.rotation.z = Math.sin(t * 0.035) * 0.045;
    pointsRef.current.rotation.y = t * 0.006;

    // Fade to 0 opacity when loading, preventing the white dot
    const targetOpacity = isLoading ? 0.0 : 0.38;
    matRef.current.opacity = THREE.MathUtils.damp(matRef.current.opacity, targetOpacity, 4, delta);

    // Gently scale, but don't crush to 0
    const targetScale = isLoading ? 0.5 : 1;
    pointsRef.current.scale.setScalar(THREE.MathUtils.damp(pointsRef.current.scale.x, targetScale, 4, delta));
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} /></bufferGeometry>
      <pointsMaterial ref={matRef} color="#b7d4ff" size={0.028} transparent opacity={0.38} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  );
}

function EtherealOrb({ isLoading, mode, result }: { isLoading: boolean, mode: string, result: any }) {
  const pointsRef = useRef<THREE.Points>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  
  const speedRef = useRef(0.22);
  const [phase, setPhase] = useState('normal');

  useEffect(() => {
    if (mode === 'results') {
      setPhase('shrinking');
      const t1 = setTimeout(() => setPhase('bursting'), 400);
      const t2 = setTimeout(() => setPhase('settled'), 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setPhase(isLoading ? 'loading' : 'normal');
    }
  }, [isLoading, mode]);

  const count = 2200;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.1 + (Math.random() - 0.5) * 0.25;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(p) * Math.cos(t);
      arr[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      arr[i * 3 + 2] = r * Math.cos(p);
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (!pointsRef.current) return;

    let targetScale = 1;
    let targetSpeed = 0.22;

    if (phase === 'loading') {
      targetScale = 0.85;       // Visibly shrinks, but doesn't vanish
      targetSpeed = 8.0;      // Insanely fast spin
    } else if (phase === 'shrinking') {
      targetScale = 0.15;      // Tiny, dense core building tension
      targetSpeed = 30.0;      // Maximum spin right before pop
    } else if (phase === 'bursting') {
      targetScale = 1.6;       // The explosion overshoot
      targetSpeed = 2.0;       // Rapid slow-down
    } else if (phase === 'settled' || phase === 'normal') {
      targetScale = 1 + Math.sin(t * 0.9) * 0.025;
      targetSpeed = 0.22;
      pointsRef.current.rotation.x = Math.sin(t * 0.45) * 0.18;
      pointsRef.current.rotation.z = Math.cos(t * 0.3) * 0.08;
    }

    // Apply exact scale and speed physics
    pointsRef.current.scale.setScalar(THREE.MathUtils.damp(pointsRef.current.scale.x, targetScale, 8, delta));
    
    // FIX: Accelerate smoothly instead of jumping the rotation timeline
    speedRef.current = THREE.MathUtils.damp(speedRef.current, targetSpeed, 3, delta);
    pointsRef.current.rotation.y += speedRef.current * delta;

    if (haloRef.current) {
      // Keep the halo glowing bright while it loads and shrinks to maintain focus
      const targetOpac = phase === 'normal' || phase === 'settled' ? 0.05 : 0.15;
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.damp((haloRef.current.material as THREE.MeshBasicMaterial).opacity, targetOpac, 4, delta);
    }
  });

  return (
    <group position={[0, 0.0, -1.6]} scale={1.0}>
      <points ref={pointsRef}>
        <bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} /></bufferGeometry>
        <pointsMaterial color="#b9d8ff" size={0.028} transparent opacity={0.82} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <mesh ref={haloRef} position={[0, 0, -0.03]}><sphereGeometry args={[0.9, 32, 32]} /><meshBasicMaterial color="#67dfff" transparent opacity={0.05} /></mesh>
    </group>
  );
}

export default function Background3D({ isLoading = false, mode = "home", result }: { isLoading?: boolean; mode?: "home" | "results"; result?: any; }) {
  return (
    <div className={`absolute inset-0 z-0 ${mode === 'home' ? 'pointer-events-none' : ''}`}>
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true }}>
        <fog attach="fog" args={['#020611', 7, 18]} />
        <ambientLight intensity={0.08} />
        
        <CameraRig />
        <VortexBackground />
        <RippleBackground isLoading={isLoading} mode={mode}/>
        <ParticleClusters isLoading={isLoading} />
        <EtherealOrb isLoading={isLoading} mode={mode} result={result} />
      </Canvas>   

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(2,6,17,0.0),rgba(2,6,17,0.42)_26%,rgba(2,6,17,0.78)_60%,rgba(2,6,17,0.96)_100%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-screen [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.22)_0.5px,transparent_0.5px)] [background-size:8px_8px]" />
    </div>
  );
}