/* eslint-disable react/prop-types */
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

import { moodUniforms } from './moodUniforms';

const vertexShader = /* glsl */ `
varying vec3 vWorld;
void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
uniform float uGridAmount;
uniform float uTime;
uniform vec3 uWaveOrigin;
uniform float uWaveRadius;
uniform float uWaveStrength;
uniform vec3 uWaveColor;
uniform vec3 uCenter;
varying vec3 vWorld;

float gridLine(vec2 p, float scale) {
    vec2 g = abs(fract(p * scale - 0.5) - 0.5) / fwidth(p * scale);
    return 1.0 - min(min(g.x, g.y), 1.0);
}

void main() {
    vec2 p = vWorld.xz;
    float d = distance(p, uCenter.xz);
    float fade = smoothstep(26.0, 7.0, d);

    float lines = gridLine(p, 0.5) * 0.8 + gridLine(p, 2.0) * 0.08;
    vec3 cyan = vec3(0.25, 0.95, 1.0);
    vec3 magenta = vec3(1.0, 0.17, 0.84);
    vec3 col = mix(cyan, magenta, smoothstep(6.0, 22.0, d));

    // Slow travelling pulse so the floor feels powered.
    float pulse = 0.65 + 0.35 * sin(d * 0.9 - uTime * 1.6);
    float alpha = lines * fade * uGridAmount * pulse * 0.4;

    float wd = distance(vWorld, uWaveOrigin);
    float edge = (wd - uWaveRadius) / 0.9;
    float wave = exp(-edge * edge) * uWaveStrength;
    col = mix(col, uWaveColor * 2.5, clamp(wave, 0.0, 1.0));
    alpha += wave * (lines * 1.2 + 0.08) * smoothstep(34.0, 6.0, wd);

    gl_FragColor = vec4(col, alpha);
}
`;

/** Synthwave floor grid under the room; brightness follows the current mood. */
export default function NeonGrid({ y = -3 }) {
    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uGridAmount: moodUniforms.uGridAmount,
                    uTime: moodUniforms.uTime,
                    uWaveOrigin: moodUniforms.uWaveOrigin,
                    uWaveRadius: moodUniforms.uWaveRadius,
                    uWaveStrength: moodUniforms.uWaveStrength,
                    uWaveColor: moodUniforms.uWaveColor,
                    uCenter: { value: new THREE.Vector3(0, 0, 0) }
                },
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            }),
        []
    );

    useEffect(() => () => material.dispose(), [material]);

    return (
        <mesh rotation-x={-Math.PI / 2} position-y={y} material={material} renderOrder={-1}>
            <planeGeometry args={[64, 64]} />
        </mesh>
    );
}
