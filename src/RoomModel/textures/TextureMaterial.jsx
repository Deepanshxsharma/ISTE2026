import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

import { moodUniforms } from '../mood/moodUniforms';
import fragmentShader from '../shaders/Room/fragment.glsl';
import vertexShader from '../shaders/Room/vertex.glsl';

export function prepareBakedTexture(texture, { pixelated = false } = {}) {
    texture.flipY = false;
    texture.colorSpace = THREE.NoColorSpace;
    texture.magFilter = pixelated ? THREE.NearestFilter : THREE.LinearFilter;
    texture.minFilter = pixelated ? THREE.NearestFilter : THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
}

/**
 * Baked day/night material whose lighting follows the shared mood uniforms.
 * `lightAmount` scales the coloured light-map contribution (0 = no lamps).
 */
export function useBakedMaterial({ day, night, lightMap, lightAmount = 1 }) {
    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    ...moodUniforms,
                    dbakedm: { value: day },
                    nbakedm: { value: night },
                    lightMapm: { value: lightMap },
                    uLightAmount: { value: lightAmount }
                }
            }),
        [day, night, lightMap, lightAmount]
    );

    useEffect(() => () => material.dispose(), [material]);

    return material;
}
