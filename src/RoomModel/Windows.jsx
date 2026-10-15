/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */

import React, { useEffect, useRef } from 'react';

import { MOODS } from '../config/moods';
import { moodTargets } from './mood/moodUniforms';

const Windows = React.memo(({ nodes }) => {
    const material = useRef();

    useEffect(() => {
        moodTargets.windowMaterial = material.current;
        return () => {
            moodTargets.windowMaterial = null;
        };
    }, []);

    return (
        <mesh
            geometry={nodes.window.geometry}
            position={nodes.window.position}
            rotation={nodes.window.rotation}
        >
            <meshBasicMaterial ref={material} toneMapped={false} color={MOODS.off.window} />
        </mesh>
    );
});

export default Windows;
