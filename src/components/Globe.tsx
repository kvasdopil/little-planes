import { useRef } from 'react';
import { TextureLoader, Vector3, ShaderMaterial, BackSide, DirectionalLight } from 'three';
import { useLoader, useFrame } from '@react-three/fiber';

const ATMOSPHERE_HEIGHT = 0.03;
// Vertex shader for Earth
const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vSunPosition;

uniform vec3 sunPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  // Calculate tangent space for bump mapping
  vec3 tangent = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
  vec3 bitangent = normalize(cross(vNormal, tangent));
  vTangent = tangent;
  vBitangent = bitangent;
  
  // Transform sun position to view space
  vSunPosition = normalize(normalMatrix * sunPosition);
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

// Fragment shader for Earth
const fragmentShader = `
uniform sampler2D dayMap;
uniform sampler2D nightMap;
uniform sampler2D bumpMap;
uniform vec3 sunPosition;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vSunPosition;

void main() {
  vec4 dayTexel = texture2D(dayMap, vUv);
  vec4 nightTexel = texture2D(nightMap, vUv);
  vec4 bumpTexel = texture2D(bumpMap, vUv);
  
  // Calculate bump mapping
  float bumpScale = -0.9;
  vec2 dSTdx = dFdx(vUv);
  vec2 dSTdy = dFdy(vUv);
  float Hll = bumpScale * texture2D(bumpMap, vUv).x;
  float dBx = bumpScale * texture2D(bumpMap, vUv + dSTdx).x - Hll;
  float dBy = bumpScale * texture2D(bumpMap, vUv + dSTdy).x - Hll;
  vec3 surfaceNormal = normalize(vNormal);
  vec3 surfaceTangent = normalize(vTangent);
  vec3 surfaceBitangent = normalize(vBitangent);
  surfaceNormal = normalize(surfaceNormal + dBx * surfaceTangent + dBy * surfaceBitangent);
  
  // Use view-space sun position
  float intensity = max(0.0, dot(surfaceNormal, normalize(vSunPosition)));
  
  // Smooth transition between day and night with enhanced contrast
  float dayMix = smoothstep(0.0, 0.3, intensity);
  
  // Mix between day and night textures
  vec4 color = mix(nightTexel, dayTexel, dayMix);
  
  // Enhanced specular highlights
  vec3 viewDir = normalize(vViewPosition);
  vec3 halfDir = normalize(vSunPosition + viewDir);
  float specular = pow(max(0.0, dot(surfaceNormal, halfDir)), 16.0);
  color.rgb += specular * 0.5;
  
  gl_FragColor = color;
}
`;

// Atmosphere vertex shader
const atmosphereVertexShader = `
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec3 vSunPosition;

uniform vec3 sunPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  
  // Transform sun position to view space
  vSunPosition = normalize(normalMatrix * sunPosition);
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

// Atmosphere fragment shader
const atmosphereFragmentShader = `
uniform vec3 sunPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec3 vSunPosition;

const float R = 2.0; // Planet radius
const float Kr = 0.0035;
const float Km = 0.0015;
const float ESun = 50.0; // Increased sun brightness for stronger scattering
const vec3 wavelength = vec3(0.650, 0.570, 0.475);
const vec3 betaR = vec3(3.0 / (16.0 * 3.14159)) * Kr / pow(wavelength, vec3(4.0));
const vec3 betaM = vec3(Kr * 0.3);

// Helper function to calculate scattering based on sun angle
float calculateScattering(float cosAngle, float sunDot) {
    // Enhanced forward scattering
    float g = 0.9; // Increased forward scattering factor
    float scatter = 1.0 - g * g;
    scatter /= (4.0 * 3.14159 * pow(1.0 + g * g - 2.0 * g * cosAngle, 1.5));
    
    // Add extra scattering near horizon
    float horizonEffect = 1.0 - abs(sunDot);
    horizonEffect = pow(horizonEffect, 3.0);
    
    return scatter * (1.0 + horizonEffect * 5.0);
}

void main() {
    // Use view-space sun position
    vec3 viewDir = normalize(vViewPosition);
    
    // Calculate sun position relative to surface using view space coordinates
    float sunDot = dot(vNormal, vSunPosition);
    
    // Enhanced atmosphere intersection
    float B = 2.0 * dot(viewDir, vNormal);
    float C = dot(vNormal, vNormal) - (R * R);
    float det = B * B - 4.0 * C;
    float near = 0.5 * (-B - sqrt(det));
    float far = 0.5 * (-B + sqrt(det));
    
    // Calculate optical depth with enhanced horizon effect
    float depth = far - near;
    float horizonDepth = 1.0 - abs(sunDot);
    horizonDepth = pow(horizonDepth, 2.0);
    float scatter = depth * mix(Kr, Km, 0.5) * (1.0 + horizonDepth * 3.0);
    
    // Enhanced Rayleigh and Mie scattering
    float cosTheta = dot(viewDir, vSunPosition);
    float rayleigh = 0.75 * (1.0 + cosTheta * cosTheta);
    float mie = calculateScattering(cosTheta, sunDot);
    
    // Altitude-based density with enhanced horizon effect
    float altitude = length(vWorldPosition) - R;
    float baseDensity = exp(-altitude * 1.5);
    float horizonDensity = 1.0 - abs(dot(viewDir, vSunPosition));
    horizonDensity = pow(horizonDensity, 2.0);
    float density = baseDensity * (1.0 + horizonDensity * 2.0);
    
    // Enhanced rim lighting
    float rim = 1.0 - abs(dot(viewDir, vNormal));
    rim = pow(rim, 2.0);
    
    // Calculate sun scattering with enhanced sunrise/sunset
    float sunsetStrength = 1.0 - abs(sunDot);
    sunsetStrength = pow(sunsetStrength, 2.0);
    vec3 sunsetColor = mix(
        vec3(1.0, 0.6, 0.3), // Sunset orange
        vec3(1.0, 0.4, 0.2), // Deep red
        sunsetStrength
    );
    
    // Enhanced atmosphere colors with sunset influence
    vec3 rayleighColor = betaR * ESun * rayleigh * density;
    vec3 mieColor = betaM * ESun * mie * density;
    vec3 atmosphereColor = (rayleighColor + mieColor) * scatter;
    
    // Add sunset coloring to atmosphere
    atmosphereColor *= mix(
        vec3(1.0),
        sunsetColor,
        sunsetStrength * 0.7
    );
    
    // Brighter color variations with enhanced sunset
    vec3 dayColor = mix(
        vec3(0.2, 0.4, 0.9),
        vec3(0.5, 0.7, 1.0),
        altitude * 0.5
    );
    
    vec3 nightColor = mix(
        vec3(0.1, 0.15, 0.3),
        vec3(0.15, 0.25, 0.45),
        altitude * 0.3
    );
    
    // Enhanced day/night transition with sunset influence
    float dayInfluence = smoothstep(-0.1, 0.3, sunDot);
    vec3 baseColor = mix(nightColor, dayColor, dayInfluence);
    baseColor = mix(baseColor, sunsetColor, sunsetStrength * (1.0 - dayInfluence) * 0.5);
    
    // Combine all effects with enhanced scattering
    vec3 finalColor = baseColor * (atmosphereColor + rim * 0.5);
    finalColor += atmosphereColor * sunsetStrength * 2.0; // Add extra glow during sunset
    
    // Adjust opacity with enhanced sunset effect
    float alpha = density * (0.5 + 0.5 * dayInfluence) * (0.6 + 0.4 * rim);
    alpha = clamp(alpha * (0.8 + sunsetStrength * 0.4), 0.0, 1.0);
    
    gl_FragColor = vec4(finalColor, alpha);
}
`;

interface GlobeProps {
  rotationSpeed: number;
}
const EARTH_RADIUS = 2;
const SUN_DISTANCE = 5;
const ECLIPTIC_TILT = 23.5 * (Math.PI / 180); // Earth's axial tilt in radians
const SEGMENTS = 128;

export const Globe = ({ rotationSpeed }: GlobeProps) => {
  const meshRef = useRef(null);
  const lightRef = useRef<DirectionalLight>(null);
  const sunPivotRef = useRef<THREE.Group>(null);

  const [dayMap, nightMap, bumpMap] = useLoader(TextureLoader, [
    'https://threejs.org/examples/textures/planets/earth_day_4096.jpg',
    'https://threejs.org/examples/textures/planets/earth_night_4096.jpg',
    'https://threejs.org/examples/textures/planets/earth_bump_roughness_clouds_4096.jpg',
  ]);

  // Create Earth material
  const earthMaterial = new ShaderMaterial({
    uniforms: {
      dayMap: { value: dayMap },
      nightMap: { value: nightMap },
      bumpMap: { value: bumpMap },
      sunPosition: { value: new Vector3(SUN_DISTANCE, 0, 0) },
    },
    vertexShader,
    fragmentShader,
  });

  // Create atmosphere material
  const atmosphereMaterial = new ShaderMaterial({
    uniforms: { sunPosition: { value: new Vector3(SUN_DISTANCE, 0, 0) } },
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    transparent: true,
    side: BackSide,
    blending: 1,
    depthWrite: false,
  });

  useFrame(({ clock }) => {
    if (sunPivotRef.current) {
      // FIXME: when i move the camera, the sun stops rotating
      // Rotate the sun pivot
      sunPivotRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed;

      // Get the sun's world position from the light
      if (lightRef.current) {
        const sunPosition = lightRef.current.getWorldPosition(new Vector3());
        earthMaterial.uniforms.sunPosition.value.copy(sunPosition);
        atmosphereMaterial.uniforms.sunPosition.value.copy(sunPosition);
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      {/* Tilted ecliptic plane for sun rotation */}
      <group rotation={[ECLIPTIC_TILT, 0, 0]}>
        <group ref={sunPivotRef}>
          <directionalLight ref={lightRef} position={[SUN_DISTANCE, 0, 0]} intensity={1} />
        </group>
      </group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[EARTH_RADIUS, SEGMENTS, SEGMENTS]} />
        <shaderMaterial
          uniforms={earthMaterial.uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * (1.0 + ATMOSPHERE_HEIGHT), SEGMENTS, SEGMENTS]} />
        <shaderMaterial
          uniforms={atmosphereMaterial.uniforms}
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          transparent
          side={BackSide}
          blending={1}
          depthWrite={false}
        />
      </mesh>
    </>
  );
};
