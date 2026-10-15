/* eslint-disable react/prop-types */
import { a, useSpring } from '@react-spring/three';
import { meshBounds } from '@react-three/drei';
import { Select } from '@react-three/postprocessing';
import { useCallback, useEffect, useRef } from 'react';

import { MOOD_ORDER, MOODS } from '../config/moods';
import { cycleMood, useRoomStore } from '../helper/RoomStore';
import { useInteractive } from '../helper/useInteractive';
import { moodTargets } from '../RoomModel/mood/moodUniforms';

const KNOB_COLOR = {
    off: [0.35, 0.4, 0.6],
    day: [2.2, 1.9, 1.5],
    night: [1.2, 1.6, 3],
    overdrive: [0.5, 2.6, 3]
};

export default function TheamSwitch({ nodes }) {
    const sphere = useRef();
    const mood = useRoomStore((s) => s.mood);
    const entered = useRoomStore((s) => s.entered);

    useEffect(() => {
        moodTargets.switchObject = sphere.current;
        return () => {
            moodTargets.switchObject = null;
        };
    }, []);

    const onSelect = useCallback(() => cycleMood(), []);
    const next = MOOD_ORDER[(MOOD_ORDER.indexOf(mood) + 1) % MOOD_ORDER.length];
    const [hovered, handlers] = useInteractive({
        id: 'switch',
        label: 'Mood switch',
        hint: `Click for ${MOODS[next].label}`,
        enabled: entered,
        onSelect
    });

    const index = Math.max(0, MOOD_ORDER.indexOf(mood));
    const { x } = useSpring({
        x: index / (MOOD_ORDER.length - 1),
        config: { mass: 4, tension: 800, friction: 35, precision: 0.001 }
    });

    const pZ = x.to([0, 1], [0.1, 0.6]);
    const rX = x.to([0, 1], [0, Math.PI * 1.3]);

    return (
        <>
            <a.group position-z={pZ}>
                <Select enabled={hovered}>
                    <a.mesh
                        ref={sphere}
                        geometry={nodes.Sphere.geometry}
                        position={nodes.Sphere.position}
                        rotation={nodes.Sphere.rotation}
                        raycast={meshBounds}
                        rotation-x={rX}
                        {...handlers}
                    >
                        <meshBasicMaterial color={KNOB_COLOR[mood]} toneMapped={false} />
                    </a.mesh>
                </Select>
            </a.group>

            <mesh
                geometry={nodes.switchBound.geometry}
                position={nodes.switchBound.position}
                rotation={nodes.switchBound.rotation}
            >
                <meshBasicMaterial color={'#0d0f22'} />
            </mesh>
        </>
    );
}
