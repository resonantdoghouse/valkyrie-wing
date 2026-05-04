

export function QuartersScene() {
  return (
    <group>
      <ambientLight intensity={0.3} color="#ffffff" />
      <directionalLight position={[2, 2, 2]} intensity={0.5} />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>

      {/* Wall */}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Bed */}
      <mesh position={[0, -1.2, -1]}>
        <boxGeometry args={[1.5, 0.5, 2]} />
        <meshStandardMaterial color="#443333" />
      </mesh>

      {/* Picture Frame (Memories) */}
      <mesh position={[0, 0.5, -1.9]}>
        <planeGeometry args={[0.8, 0.6]} />
        <meshStandardMaterial color="#ffffff" emissive="#333333" />
      </mesh>
      <mesh position={[0, 0.5, -1.91]}>
         <boxGeometry args={[0.9, 0.7, 0.05]} />
         <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  );
}
