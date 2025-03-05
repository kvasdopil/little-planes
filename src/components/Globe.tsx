import { useRef } from 'react';
import { TextureLoader, Vector3, ShaderMaterial, BackSide } from 'three';
import { useLoader, useFrame } from '@react-three/fiber';

// Vertex shader for Earth
const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vTangent;
varying vec3 vBitangent;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  // Calculate tangent space for bump mapping
  vec3 tangent = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
  vec3 bitangent = normalize(cross(vNormal, tangent));
  vTangent = tangent;
  vBitangent = bitangent;
  
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
  
  vec3 normalizedSunPos = normalize(sunPosition);
  float intensity = max(0.0, dot(surfaceNormal, normalizedSunPos));
  
  // Smooth transition between day and night with enhanced contrast
  float dayMix = smoothstep(0.0, 0.3, intensity);
  
  // Mix between day and night textures
  vec4 color = mix(nightTexel, dayTexel, dayMix);
  
  // Enhanced specular highlights
  vec3 viewDir = normalize(vViewPosition);
  vec3 halfDir = normalize(normalizedSunPos + viewDir);
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

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
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

void main() {
  vec3 normalizedSunPos = normalize(sunPosition);
  vec3 viewDir = normalize(vViewPosition);
  
  // Calculate atmosphere depth based on view angle
  float atmosphereDepth = 1.0 - max(0.0, dot(viewDir, vNormal));
  
  // Calculate sun influence
  float sunInfluence = max(0.0, dot(vNormal, normalizedSunPos));
  
  // Enhanced Fresnel effect
  float fresnel = pow(atmosphereDepth, 3.0);
  
  // Atmosphere density gradient
  float density = fresnel * (0.5 + sunInfluence * 0.5);
  
  // Darken the atmosphere on the night side
  density *= smoothstep(-0.2, 0.3, sunInfluence);
  
  // Atmosphere color (more subtle blue)
  vec3 atmosphereColor = mix(
    vec3(0.1, 0.2, 0.5),   // Dark blue base
    vec3(0.4, 0.6, 1.0),   // Light blue scatter
    sunInfluence
  );
  
  // Final color with enhanced scattering
  vec3 finalColor = atmosphereColor * density;
  
  // Adjust opacity based on viewing angle and sun position
  float alpha = density * 0.5 * smoothstep(-0.2, 0.3, sunInfluence);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

export const Globe = () => {
  const meshRef = useRef(null);
  const sunRef = useRef(new Vector3(5, 3, 5));

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
      sunPosition: { value: sunRef.current },
    },
    vertexShader,
    fragmentShader,
  });

  // Create atmosphere material
  const atmosphereMaterial = new ShaderMaterial({
    uniforms: {
      sunPosition: { value: sunRef.current },
    },
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    transparent: true,
    side: BackSide,
    blending: 1,
    depthWrite: false,
  });

  useFrame(({ clock }) => {
    // Rotate sun around the earth
    const angle = clock.getElapsedTime() * 0.2;
    sunRef.current.x = Math.cos(angle) * 5;
    sunRef.current.z = Math.sin(angle) * 5;
    sunRef.current.y = 3;

    // Update uniforms
    earthMaterial.uniforms.sunPosition.value = sunRef.current;
    atmosphereMaterial.uniforms.sunPosition.value = sunRef.current;
  });

  /* eslint-disable react/no-unknown-property */
  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <shaderMaterial 
          uniforms={earthMaterial.uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.15, 64, 64]} />
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
  /* eslint-enable react/no-unknown-property */
};
