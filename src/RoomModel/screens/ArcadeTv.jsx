/* eslint-disable react/display-name */
import { Html } from '@react-three/drei';
import React from 'react';

import { useCameraStore } from '../../helper/CameraStore';
import NeonBreaker from './NeonBreaker';

const ArcadeTv = React.memo(() => {
    const isTv = useCameraStore((s) => s.cameraState === 'tv');
    if (!isTv) return null;
    return (
        <Html
            transform
            wrapperClass="htmlScreen"
            distanceFactor={0.925}
            occlude="blending"
            position={[2.28, 2.72, -3.6]}
            zIndexRange={[2, 1]}
        >
            <NeonBreaker />
        </Html>
    );
});

export default ArcadeTv;
