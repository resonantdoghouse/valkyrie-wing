import { useMemo } from 'react';
import * as THREE from 'three';

export function Starfield() {
  // Generate 5000 random stars
  const { positions, colors } = useMemo(() => {
    const starCount = 5000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // Random position in a large sphere
      const r = 800 + Math.random() * 800; // Radius between 800 and 1600
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Random color: mostly white/blue with occasional orange/red
      const color = new THREE.Color();
      const rand = Math.random();
      if (rand > 0.9) color.setHex(0xffaa00); // orange
      else if (rand > 0.8) color.setHex(0x00ccff); // blue
      else color.setHex(0xffffff); // white
      
      // Dim the stars based on distance
      color.multiplyScalar(0.5 + Math.random() * 0.5);

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={2} vertexColors transparent opacity={0.8} sizeAttenuation={true} fog={false} />
    </points>
  );
}
