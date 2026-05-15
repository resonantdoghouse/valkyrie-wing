import * as THREE from 'three';

// ─── Engine Plasma ────────────────────────────────────────────────────────────

export const engineGlowVert = /* glsl */`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPos.xyz;
  gl_Position = projectionMatrix * mvPos;
}
`;

export const engineGlowFrag = /* glsl */`
uniform float uTime;
uniform vec3 uCoreColor;
uniform vec3 uFlameColor;
uniform float uIntensity;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * valueNoise(p);
    p = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 viewDir = normalize(vViewPosition);
  float facing = clamp(dot(viewDir, vNormal), 0.0, 1.0);

  float t = uTime;
  float n1 = fbm(vUv * 3.5 + vec2(t * 0.3, t * 0.7));
  float n2 = fbm(vUv * 7.0 - vec2(t * 0.5, t * 0.2) + n1 * 0.4);
  float plasma = clamp(n1 * 0.6 + n2 * 0.4, 0.0, 1.0);

  float pulse = 0.8 + 0.2 * sin(t * 9.0 + plasma * 8.0);

  vec3 col = mix(uFlameColor, uCoreColor, pow(plasma, 0.6) * facing);
  col += uCoreColor * pow(facing, 3.0) * 1.5;
  col *= pulse * uIntensity;

  float alpha = (0.5 + plasma * 0.5) * (0.3 + facing * 0.7) * uIntensity;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`;

export function makeEngineGlowMaterial(coreHex: string, flameHex: string) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime:      { value: 0 },
      uCoreColor: { value: new THREE.Color(coreHex) },
      uFlameColor:{ value: new THREE.Color(flameHex) },
      uIntensity: { value: 1.0 },
    },
    vertexShader: engineGlowVert,
    fragmentShader: engineGlowFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
  });
}

// ─── Laser Bolt ───────────────────────────────────────────────────────────────

export const laserVert = /* glsl */`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vUv = uv;
  #ifdef USE_INSTANCING
    vec4 mvPos = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
  #else
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
  #endif
  vViewPosition = -mvPos.xyz;
  gl_Position = projectionMatrix * mvPos;
}
`;

export const laserFrag = /* glsl */`
uniform float uTime;
uniform vec3 uColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

float hash1(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  // Face-on = bright core, edges = dim
  vec3 viewDir = normalize(vViewPosition);
  float facing = abs(dot(viewDir, normalize(vNormal)));
  float core = pow(facing, 0.35);

  // Pulse traveling from rear to tip
  float pulse = 0.75 + 0.25 * sin(vUv.y * 22.0 - uTime * 35.0);

  // Rare energy sparks
  float sparkSlot = floor(vUv.y * 18.0) + floor(uTime * 12.0) * 37.3;
  float spark = step(0.97, hash1(sparkSlot));

  // End-cap fade so tips look like bolts not cylinders
  float endFade = smoothstep(0.0, 0.07, vUv.y) * smoothstep(1.0, 0.93, vUv.y);

  vec3 col = uColor * (1.5 + core * 2.5) * pulse;
  col += uColor * spark * 4.0;
  col += vec3(1.0) * core * 0.6;

  float alpha = endFade * (0.45 + core * 0.55) * pulse;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`;

export function makeLaserMaterial(colorHex: string) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime:  { value: 0 },
      uColor: { value: new THREE.Color(colorHex) },
    },
    vertexShader: laserVert,
    fragmentShader: laserFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

// ─── Explosion / Fire ─────────────────────────────────────────────────────────

export const explosionVert = /* glsl */`
uniform float uTime;
uniform float uProgress;

varying vec3 vNormal;
varying float vDisplace;

float hash3f(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.x + p.y) * p.z);
}

float noise3(vec3 p) {
  vec3 i = floor(p); vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3f(i),             hash3f(i+vec3(1,0,0)), f.x),
        mix(hash3f(i+vec3(0,1,0)), hash3f(i+vec3(1,1,0)), f.x), f.y),
    mix(mix(hash3f(i+vec3(0,0,1)), hash3f(i+vec3(1,0,1)), f.x),
        mix(hash3f(i+vec3(0,1,1)), hash3f(i+vec3(1,1,1)), f.x), f.y),
    f.z);
}

void main() {
  vNormal = normal;
  float n = noise3(normal * 4.5 + uTime * 1.8);
  float n2 = noise3(normal * 9.0 - uTime * 2.5) * 0.5;
  float disp = (n + n2) * 0.35 * (1.0 - uProgress * 0.55);
  vDisplace = n * 0.65 + n2 * 0.35;
  vec3 displaced = position + normal * disp;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

export const explosionFrag = /* glsl */`
uniform float uTime;
uniform float uProgress;
uniform float uOpacity;

varying vec3 vNormal;
varying float vDisplace;

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash21(i), hash21(i+vec2(1,0)), f.x),
             mix(hash21(i+vec2(0,1)), hash21(i+vec2(1,1)), f.x), f.y);
}

float fbm2(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * valueNoise(p); p = p*2.1+vec2(1.7,9.2); a*=0.5; }
  return v;
}

void main() {
  vec2 nuv = vNormal.xz * 0.5 + 0.5;
  float n = fbm2(nuv * 4.0 + vec2(uTime * 1.4, uTime * 0.8));
  float n2 = fbm2(nuv * 8.0 - vec2(uTime * 0.6, uTime * 1.9)) * 0.5;
  float heat = clamp((n + n2) / 1.5, 0.0, 1.0) * (1.0 - uProgress * 0.85);
  heat = max(heat, vDisplace * (1.0 - uProgress));

  vec3 col;
  if (heat > 0.75)
    col = mix(vec3(1.0, 0.92, 0.55), vec3(1.0, 1.0, 1.0), (heat - 0.75) / 0.25);
  else if (heat > 0.5)
    col = mix(vec3(1.0, 0.48, 0.04), vec3(1.0, 0.92, 0.55), (heat - 0.5) / 0.25);
  else if (heat > 0.25)
    col = mix(vec3(0.55, 0.04, 0.0), vec3(1.0, 0.48, 0.04), (heat - 0.25) / 0.25);
  else
    col = mix(vec3(0.08, 0.0, 0.0), vec3(0.55, 0.04, 0.0), heat / 0.25);

  col *= 0.85 + 0.15 * sin(uTime * 20.0 + vDisplace * 14.0);

  float alpha = uOpacity * (0.4 + heat * 0.6) * (1.0 - uProgress * 0.9);
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`;

export function makeExplosionMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime:     { value: 0 },
      uProgress: { value: 0 },
      uOpacity:  { value: 1 },
    },
    vertexShader: explosionVert,
    fragmentShader: explosionFrag,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// ─── Nebula ───────────────────────────────────────────────────────────────────

export const nebulaVert = /* glsl */`
varying vec3 vWorldNormal;

void main() {
  vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const nebulaFrag = /* glsl */`
uniform float uTime;

varying vec3 vWorldNormal;

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash21(i), hash21(i+vec2(1,0)), f.x),
             mix(hash21(i+vec2(0,1)), hash21(i+vec2(1,1)), f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) { v += a * valueNoise(p); p = p*2.1+vec2(1.7,9.2); a*=0.45; }
  return v;
}

void main() {
  vec3 d = normalize(vWorldNormal);
  float t = uTime * 0.018;

  // Two UV projections blended to avoid polar seams
  vec2 uv1 = d.xz * 0.5 + 0.5 + t;
  vec2 uv2 = d.xy * 0.5 + 0.5 + vec2(-t * 0.7, t * 0.5);

  float n1 = fbm(uv1 * 2.5);
  float n2 = fbm(uv2 * 2.0 + n1 * 0.6);
  float n3 = fbm(uv1 * 5.0 - n2 * 0.4 + t);
  float cloud = clamp(n1 * 0.5 + n2 * 0.35 + n3 * 0.15, 0.0, 1.0);

  // Color bands: violet → cobalt → teal → magenta
  vec3 c1 = vec3(0.25, 0.0,  0.55);  // deep violet
  vec3 c2 = vec3(0.0,  0.15, 0.70);  // cobalt blue
  vec3 c3 = vec3(0.0,  0.55, 0.60);  // teal
  vec3 c4 = vec3(0.55, 0.0,  0.45);  // magenta

  float band = fbm(d.yz * 1.5 + t * 0.5);
  vec3 col = mix(c1, c2, smoothstep(0.0, 0.35, band));
  col = mix(col, c3, smoothstep(0.35, 0.65, band));
  col = mix(col, c4, smoothstep(0.65, 1.0, band));

  // Star-burst highlights
  float bright = smoothstep(0.72, 1.0, cloud);
  col += vec3(0.9, 0.85, 1.0) * bright * 0.35;

  float alpha = cloud * cloud * 0.22;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`;

export function makeNebulaMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: nebulaVert,
    fragmentShader: nebulaFrag,
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
  });
}

// ─── Sun Surface ──────────────────────────────────────────────────────────────

export const sunSurfaceVert = /* glsl */`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPos.xyz;
  gl_Position = projectionMatrix * mvPos;
}
`;

export const sunSurfaceFrag = /* glsl */`
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * valueNoise(p);
    p = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 viewDir = normalize(vViewPosition);
  float facing = clamp(dot(viewDir, vNormal), 0.0, 1.0);

  // Limb darkening: real sun ~cos^0.45 power law
  float limb = pow(facing, 0.45);

  // Slow animated solar granulation
  float t = uTime * 0.035;
  float n1 = fbm(vUv * 5.0 + vec2(t * 0.5, t * 0.3));
  float n2 = fbm(vUv * 11.0 - vec2(t * 0.4, t * 0.6) + n1 * 0.4);
  float granule = n1 * 0.6 + n2 * 0.4;

  // Color: white-hot core → golden → deep orange-red at limb
  vec3 coreColor = vec3(1.0,  0.97, 0.88);
  vec3 midColor  = vec3(1.0,  0.75, 0.12);
  vec3 limbColor = vec3(0.85, 0.22, 0.03);

  vec3 col = mix(limbColor, midColor, smoothstep(0.0, 0.55, limb));
  col      = mix(col, coreColor,      smoothstep(0.45, 0.98, limb));

  // Granulation brightness modulation
  col *= 0.82 + granule * 0.35;

  // Subtle solar pulse
  col *= 0.97 + 0.03 * sin(uTime * 1.8 + n1 * 15.0);

  // Solar flare hotspots
  float flareNoise = fbm(vUv * 2.5 + vec2(uTime * 0.08, uTime * 0.06));
  float flare = smoothstep(0.65, 0.82, flareNoise) * facing;
  col += vec3(1.0, 0.88, 0.42) * flare * 0.9;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function makeSunSurfaceMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: sunSurfaceVert,
    fragmentShader: sunSurfaceFrag,
    side: THREE.FrontSide,
  });
}

// ─── Sun Corona ───────────────────────────────────────────────────────────────

export const sunCoronaVert = /* glsl */`
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPos.xyz;
  gl_Position = projectionMatrix * mvPos;
}
`;

export const sunCoronaFrag = /* glsl */`
uniform float uTime;
uniform float uScale;   // 1.0 for inner corona, fades further out

varying vec3 vNormal;
varying vec3 vViewPosition;

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i+vec2(1,0)), f.x),
             mix(hash21(i+vec2(0,1)), hash21(i+vec2(1,1)), f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * valueNoise(p);
    p = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 viewDir = normalize(vViewPosition);
  vec3 n = normalize(vNormal);
  float facing = clamp(dot(viewDir, n), 0.0, 1.0);

  // Edge glow — bright at rim where ray grazes atmosphere
  float edgeGlow = 1.0 - facing;
  float corona = pow(edgeGlow, 1.4);

  // Corona tendrils using seam-free normal-space UVs
  float t = uTime * 0.035;
  vec2 uv1 = n.xz * 0.5 + 0.5 + t;
  vec2 uv2 = n.xy * 0.5 + 0.5 - vec2(t * 0.7, t * 0.5);
  float tendrils = fbm(uv1 * 3.5) * 0.6 + fbm(uv2 * 2.5) * 0.4;

  float intensity = corona * (0.55 + tendrils * 0.7) * edgeGlow * uScale;

  vec3 innerCol = vec3(1.0, 0.92, 0.68);
  vec3 outerCol = vec3(1.0, 0.45, 0.08);
  vec3 col = mix(innerCol, outerCol, edgeGlow * 0.8);
  col += vec3(1.0, 0.78, 0.28) * tendrils * 0.25;

  float alpha = intensity * 0.65;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`;

export function makeSunCoronaMaterial(scale = 1.0) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime:  { value: 0 },
      uScale: { value: scale },
    },
    vertexShader: sunCoronaVert,
    fragmentShader: sunCoronaFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  });
}
