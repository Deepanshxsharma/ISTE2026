/* eslint-disable react/display-name */
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Outline, Selection } from '@react-three/postprocessing';
import React, { Suspense, useEffect } from 'react';

import { CameraManager } from './CameraManager/CameraManager';
import { MOODS } from './config/moods';
import { useRoomStore } from './helper/RoomStore';
import MoodController from './RoomModel/mood/MoodController';
import { moodTargets } from './RoomModel/mood/moodUniforms';
import RoomModel from './RoomModel/roomModel';

function SceneReady() {
    useEffect(() => {
        const id = requestAnimationFrame(() => useRoomStore.setState({ sceneReady: true }));
        return () => cancelAnimationFrame(id);
    }, []);
    return null;
}

const registerBloom = (effect) => {
    moodTargets.bloom = effect;
};

const Experience = React.memo(() => (
    <Canvas
        className="scene"
        dpr={[1, 1.75]}
        camera={{ fov: 35, near: 0.1, far: 200, position: [27, 13, -27] }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
    >
        <Suspense fallback={null}>
            <Selection>
                <EffectComposer autoClear={false} multisampling={4}>
                    <Outline
                        blur
                        visibleEdgeColor={0x41f3ff}
                        hiddenEdgeColor={0x8a5bff}
                        edgeStrength={40}
                        width={2000}
                    />
                    <Bloom
                        ref={registerBloom}
                        mipmapBlur
                        intensity={MOODS.off.bloom}
                        luminanceThreshold={0.85}
                        luminanceSmoothing={0.2}
                    />
                </EffectComposer>
                <CameraManager />
                <RoomModel />
                <MoodController />
                <SceneReady />
            </Selection>
        </Suspense>
    </Canvas>
));

export default Experience;
